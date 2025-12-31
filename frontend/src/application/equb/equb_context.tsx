import React, { createContext, useContext, useState, ReactNode } from 'react';

// Global Equb Context for managing active Equb selection
// This ensures all screens have access to the current Equb context

interface EqubContextType {
    activeEqubId: string | null;
    setActiveEqubId: (id: string | null) => void;
    activeEqubName: string | null;
    setActiveEqubName: (name: string | null) => void;
}

const EqubContext = createContext<EqubContextType | undefined>(undefined);

interface EqubProviderProps {
    children: ReactNode;
}

export const EqubProvider: React.FC<EqubProviderProps> = ({ children }) => {
    const [activeEqubId, setActiveEqubId] = useState<string | null>(null);
    const [activeEqubName, setActiveEqubName] = useState<string | null>(null);

    return (
        <EqubContext.Provider
            value={{
                activeEqubId,
                setActiveEqubId,
                activeEqubName,
                setActiveEqubName
            }}
        >
            {children}
        </EqubContext.Provider>
    );
};

export const useEqubContext = (): EqubContextType => {
    const context = useContext(EqubContext);
    if (!context) {
        throw new Error('useEqubContext must be used within an EqubProvider');
    }
    return context;
};
