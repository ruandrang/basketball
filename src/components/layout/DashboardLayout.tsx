'use client';

import Sidebar from './Sidebar';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
    clubId: string;
    clubName: string;
    username?: string;
    children: React.ReactNode;
}

export default function DashboardLayout({ clubId, clubName, username, children }: DashboardLayoutProps) {
    return (
        <div className={styles.layout}>
            <Sidebar clubId={clubId} clubName={clubName} username={username} />
            <main className={styles.main}>
                <div className={styles.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}
