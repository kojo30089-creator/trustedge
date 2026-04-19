"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "@/lib/validations/auth";
import { EyeClosedIcon, EyeIcon, Loader2Icon, Calendar1 } from "lucide-react";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";
import { nanoid } from 'nanoid';

// --- UI Components ---
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import PhoneInput from "@/components/ui/PhoneInput";

// --- FIREBASE IMPORTS ---
import { auth, db } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, serverTimestamp, addDoc } from "firebase/firestore";
import { Input } from "../ui/input";

export default function SignUpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ref = searchParams.get("ref");

    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<SignUpSchema>({
        defaultValues: {
            fname: "",
            lname: "",
            email: "",
            password: "",
            confirm_password: "",
            gender: undefined,
            date_of_birth: "",
            country: "",
            state: "",
            city: "",
            zip: "",
            phone: "+234",
            address: "",
            referred_by: ref || "",
            terms: false,
        },
        resolver: zodResolver(signUpSchema),
    });

    const [countryCode, setCountryCode] = useState<string>("");
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedState, setSelectedState] = useState<string>("");
    const [states, setStates] = useState<{ value: string; label: string }[]>([]);
    const [cities, setCities] = useState<{ value: string; label: string }[]>([]);

    const countries = Country.getAllCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
    }));

    const genders = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'others', label: 'Others' }
    ];

    const handleCountryChange = (isoCode: string) => {
        setSelectedCountry(isoCode);
        const selectedCountryData = Country.getCountryByCode(isoCode);
        if (selectedCountryData) {
            setCountryCode("+" + selectedCountryData.phonecode);
        }
        const countryStates = State.getStatesOfCountry(isoCode).map((state) => ({
            value: state.isoCode,
            label: state.name,
        }));
        if (countryStates.length > 0) {
            setStates(countryStates);
        } else {
            setStates([]);
            setCities([]);
        }
    };

    const handleStateChange = (isoCode: string) => {
        setSelectedState(isoCode);
        const stateCities = City.getCitiesOfState(selectedCountry, isoCode).map((city) => ({
            value: city.name,
            label: city.name,
        }));
        setCities(stateCities);
    };

    const onSubmit = async (data: SignUpSchema) => {
        setLoading(true);
        const { email, password, fname, lname, gender, date_of_birth, phone, country, address, zip, city, state, referred_by } = data;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const referral_code = nanoid(8);

            const selectedCountryObj = Country.getCountryByCode(country);
            const selectedStateObj = state && country ? State.getStateByCodeAndCountry(state, country) : undefined;
            const fullCountryName = selectedCountryObj?.name || country;
            const fullStateName = selectedStateObj?.name || state || "";
            const cleanedPhone = phone.replace(/^\+/, "");
            const fullPhoneNumber = `${countryCode}${cleanedPhone}`;

            await setDoc(doc(db, "users", firebaseUser.uid), {
                userId: firebaseUser.uid,
                email,
                password,
                firstName: fname,
                lastName: lname,
                fullName: `${fname} ${lname}`,
                gender: gender || "",
                dob: date_of_birth || "",
                country: fullCountryName,
                state: fullStateName,
                city: city || "",
                zip: zip || "",
                address: address || "",
                phone: fullPhoneNumber,
                referredBy: referred_by || "",
                tierLevel: 1,
                refereeId: referral_code,
                kycStatus: "pending",
                totalDeposit: 0,
                profit: 10,
                role: "user",
                status: "active",
                createdAt: serverTimestamp(),
            });

            await addDoc(collection(db, "notifications"), {
                userId: firebaseUser.uid,
                title: "Welcome!",
                message: "Your account has successfully been created.",
                type: "info",
                isRead: false,
                createdAt: serverTimestamp(),
            });

            await addDoc(collection(db, "transactions"), {
                userId: firebaseUser.uid,
                amount: 10,
                status: "approved",
                type: "bonus",
                method: "Welcome Bonus",
                createdAt: serverTimestamp(),
            });

            toast.success("Account initialized successfully.");
            setLoading(false);
            setTimeout(() => router.push("/signin"), 2000);

        } catch (error: any) {
            setLoading(false);
            console.error("Full Signup Error:", error);
            if (error.code === "auth/email-already-in-use") {
                toast.error("Email already registered. Try authenticating.");
            } else if (error.code === "permission-denied") {
                toast.error("Database permission denied. Check security rules.");
            } else {
                toast.error(error.message || "An error occurred during initialization.");
            }
        }
    };

    // Shared styling for all inputs to ensure immaculate consistency
    const baseInputStyles = "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#e51837]/20 focus:border-[#e51837] transition-all duration-300 shadow-sm";
    const baseLabelStyles = "text-sm font-medium text-slate-700 dark:text-slate-300";

    return (
        <div className="w-full flex flex-col pb-10">

            {/* Dynamic Header */}
            <div className="mb-10 text-center sm:text-left">
                <h2 className="text-3xl font-medium tracking-tight text-slate-900 dark:text-white mb-2">
                    Initialize Account.
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Establish your profile to access the platform.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off" noValidate className="space-y-6">

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* First Name */}
                        <FormField
                            control={form.control}
                            name="fname"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your first name" className={baseInputStyles} type="text" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />

                        {/* Last Name */}
                        <FormField
                            control={form.control}
                            name="lname"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your last name" className={baseInputStyles} type="text" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className={baseLabelStyles}>Email address</FormLabel>
                                <FormControl>
                                    <Input autoComplete="off" placeholder="name@company.com" className={baseInputStyles} type="email" {...field} />
                                </FormControl>
                                <FormMessage className="text-xs text-[#e51837]" />
                            </FormItem>
                        )}
                    />

                    {/* Passwords Row */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                autoComplete="new-password"
                                                placeholder="Create password"
                                                type={showPassword ? "text" : "password"}
                                                className={`${baseInputStyles} pr-12`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeClosedIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password */}
                        <FormField
                            control={form.control}
                            name="confirm_password"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>Confirm Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                placeholder="Re-enter password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                className={`${baseInputStyles} pr-12`}
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeIcon className="h-4 w-4" /> : <EyeClosedIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Gender */}
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>Gender</FormLabel>
                                    <FormControl>
                                        <Select value={field.value || ""} onValueChange={field.onChange}>
                                            <SelectTrigger className={`${baseInputStyles} h-auto py-3.5`}>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
                                                {genders.map((g) => (
                                                    <SelectItem key={g.value} value={g.value} className="focus:bg-slate-100 dark:focus:bg-white/5">
                                                        {g.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />

                        {/* Date of Birth */}
                        <FormField
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>Date of Birth</FormLabel>
                                    <FormControl>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={`${baseInputStyles} flex justify-between items-center text-left ${!field.value && "text-slate-500"}`}
                                                >
                                                    {field.value ? (
                                                        (() => {
                                                            const [yyyy, mm, dd] = field.value.split("-");
                                                            return `${dd}-${mm}-${yyyy}`;
                                                        })()
                                                    ) : (
                                                        "Select a date"
                                                    )}
                                                    <Calendar1 className="h-4 w-4 opacity-50" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto overflow-hidden p-0 border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    captionLayout="dropdown"
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            const year = date.getFullYear();
                                                            const month = (date.getMonth() + 1).toString().padStart(2, "0");
                                                            const day = date.getDate().toString().padStart(2, "0");
                                                            field.onChange(`${year}-${month}-${day}`);
                                                        } else {
                                                            field.onChange("");
                                                        }
                                                        setOpen(false);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Country */}
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>Country</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value || ""}
                                            onValueChange={(value: string) => {
                                                field.onChange(value);
                                                handleCountryChange(value);
                                            }}
                                        >
                                            <SelectTrigger className={`${baseInputStyles} h-auto py-3.5`}>
                                                <SelectValue placeholder="Select Country" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
                                                {countries.map((g) => (
                                                    <SelectItem key={g.value} value={g.value} className="focus:bg-slate-100 dark:focus:bg-white/5">
                                                        {g.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />

                        {/* State */}
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>State/Region</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={field.value || ""}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                handleStateChange(value);
                                            }}
                                        >
                                            <SelectTrigger className={`${baseInputStyles} h-auto py-3.5`}>
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
                                                {states.map((g) => (
                                                    <SelectItem key={g.value} value={g.value} className="focus:bg-slate-100 dark:focus:bg-white/5">
                                                        {g.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* City */}
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>City</FormLabel>
                                    <FormControl>
                                        <Select value={field.value || ""} onValueChange={field.onChange}>
                                            <SelectTrigger className={`${baseInputStyles} h-auto py-3.5`}>
                                                <SelectValue placeholder="Select city" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-[#0a0a0a] border-slate-200 dark:border-white/10">
                                                {cities.map((g) => (
                                                    <SelectItem key={g.value} value={g.value} className="focus:bg-slate-100 dark:focus:bg-white/5">
                                                        {g.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />

                        {/* ZIP Code */}
                        <FormField
                            control={form.control}
                            name="zip"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <FormLabel className={baseLabelStyles}>ZIP Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter ZIP" className={baseInputStyles} type="text" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs text-[#e51837]" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className={baseLabelStyles}>Phone Number</FormLabel>
                                <FormControl>
                                    <div className="[&_.phone-input-wrapper]:bg-transparent">
                                        <PhoneInput
                                            countries={[{ code: countryCode || '+1', label: countryCode }]}
                                            placeholder="Enter your phone"
                                            onChange={(value) => field.onChange(value)}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className="text-xs text-[#e51837]" />
                            </FormItem>
                        )}
                    />

                    {/* Address */}
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className={baseLabelStyles}>Address</FormLabel>
                                <FormControl>
                                    <textarea
                                        placeholder="Full street address"
                                        className={`${baseInputStyles} min-h-[100px] resize-none`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-[#e51837]" />
                            </FormItem>
                        )}
                    />

                    {/* Referral */}
                    <FormField
                        control={form.control}
                        name="referred_by"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className={baseLabelStyles}>Referral Code (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        readOnly={!!ref}
                                        placeholder="Enter code"
                                        className={`${baseInputStyles} ${!!ref ? 'opacity-70 bg-slate-100 dark:bg-white/10 cursor-not-allowed' : ''}`}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs text-[#e51837]" />
                            </FormItem>
                        )}
                    />

                    {/* Terms Checkbox */}
                    <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                            <FormItem className="flex items-start gap-3 space-y-0 mt-4">
                                <FormControl>
                                    <Checkbox
                                        checked={!!field.value}
                                        onCheckedChange={field.onChange}
                                        className="mt-1 border-slate-300 dark:border-white/20 data-[state=checked]:bg-[#e51837] data-[state=checked]:border-[#e51837]"
                                    />
                                </FormControl>
                                <FormLabel className="text-xs inline-block font-medium text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed">
                                    I acknowledge and agree to the platform's{" "}
                                    <Link href="/terms" className="text-slate-900 dark:text-white hover:text-[#e51837] dark:hover:text-[#e51837] transition-colors underline underline-offset-4">
                                        Terms of Service
                                    </Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" className="text-slate-900 dark:text-white hover:text-[#e51837] dark:hover:text-[#e51837] transition-colors underline underline-offset-4">
                                        Privacy Policy
                                    </Link>.
                                </FormLabel>
                            </FormItem>
                        )}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold tracking-widest uppercase text-[11px] transition-all duration-300 hover:bg-[#e51837] dark:hover:bg-[#e51837] dark:hover:text-white hover:shadow-lg hover:shadow-[#e51837]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                                Initializing Core...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Bottom Redirect */}
                <div className="mt-8 text-center sm:text-left border-t border-slate-200 dark:border-white/10 pt-8">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Already have an account? {' '}
                        <Link
                            href="/signin"
                            className="text-slate-900 dark:text-white hover:text-[#e51837] dark:hover:text-[#e51837] transition-colors underline underline-offset-4"
                        >
                            Authenticate here
                        </Link>
                    </p>
                </div>
            </Form>
        </div>
    );
}