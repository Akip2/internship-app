"use client";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface PopupContextType {
    openPopup: (content: ReactNode) => void;
    closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const PopupProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [content, setContent] = useState<ReactNode>(null);

    const openPopup = (content: ReactNode) => {
        setContent(content);
        setOpen(true);
    }

    const closePopup = () => {
        setOpen(false);
    }

    return (
        <PopupContext.Provider value={{ openPopup, closePopup }}>
            {children}

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={closePopup} 
                >
                    <div
                        className="bg-white rounded-lg p-6 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {content}
                    </div>
                </div>
            )}
        </PopupContext.Provider>
    );
};

export const usePopup = () => {
    const context = useContext(PopupContext);
    return context!;
};
