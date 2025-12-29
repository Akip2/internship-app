import { useState } from "react";
import TabButton from "../shared/tab-button";
import { Tab } from "@/lib/types";

export default function ContentTabs(props: {
    className?: string,
    tabs: Tab[]
}) {
    const { className, tabs } = props;

    const [activeTab, setActiveTab] = useState(tabs[0].label);

    const currentTab = tabs.find((t) => t.label === activeTab);

    return (
        <div className={className}>
            <div className="border-b bg-white">
                <div className="max-w-7xl mx-auto flex gap-6 px-6">
                    {tabs.map((tab) => (
                        <TabButton
                            active={tab.label === activeTab}
                            onClick={() => setActiveTab(tab.label)}
                        >
                            {tab.label}
                        </TabButton>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {currentTab?.content}
            </div>
        </div>
    );
}