import InvestmentPlansPage from '@/components/investmentPlan/InvestmentPlan'
import React, { use } from 'react'

export default function InvestmentPlans({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    return (
        <InvestmentPlansPage slug={slug} />
    )
}
