"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface KycDocumentCardProps {
    frontImageUrl?: string | null;
    backImageUrl?: string | null;
}

export default function KycDocumentCard({
    frontImageUrl,
    backImageUrl,
}: KycDocumentCardProps) {
    const [open, setOpen] = useState(false);

    if (!frontImageUrl && !backImageUrl) return null;

    return (
        <>
            {/* Button Box */}
            <div className="p-6 border border-border rounded-2xl bg-card">
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    KYC Documents
                </h4>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    View government-issued ID submitted for verification
                </p>

                <Button 
                    onClick={() => setOpen(true)}
                    className="rounded-xl h-11 px-5 text-sm font-medium"
                >
                    View Documents
                </Button>
            </div>

            {/* Modal Preview */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl bg-card p-0 overflow-hidden">
                    
                    <DialogHeader className="px-6 pt-5 pb-2 border-b border-border">
                        <DialogTitle className="text-lg font-semibold">
                            KYC Verification Documents
                        </DialogTitle>
                        <p className="text-xs text-gray-500 mt-1">
                            Click outside to close
                        </p>
                    </DialogHeader>

                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

                        {frontImageUrl && (
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Front of ID
                                </p>
                                <div className="rounded-xl overflow-hidden border border-border">
                                    <Image
                                        src={frontImageUrl}
                                        alt="Front ID"
                                        width={900}
                                        height={600}
                                        className="w-full h-auto object-contain bg-black/5 dark:bg-white/5"
                                    />
                                </div>
                            </div>
                        )}

                        {backImageUrl && (
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    Back of ID
                                </p>
                                <div className="rounded-xl overflow-hidden border border-border">
                                    <Image
                                        src={backImageUrl}
                                        alt="Back ID"
                                        width={900}
                                        height={600}
                                        className="w-full h-auto object-contain bg-black/5 dark:bg-white/5"
                                    />
                                </div>
                            </div>
                        )}

                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
