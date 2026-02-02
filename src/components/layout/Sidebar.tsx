'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import styles from './Sidebar.module.css';

interface SidebarProps {
    clubId: string;
    clubName: string;
    username?: string;
}

const menuItems = [
    { icon: '🏠', label: '홈', href: '/dashboard' },
    { icon: '👥', label: '멤버 관리', href: '/members' },
    { icon: '👕', label: '팀 구성', href: '/generate' },
    { icon: '🏆', label: '경기 기록', href: '/history' },
    { icon: '📊', label: '통계', href: '/stats' },
];

export default function Sidebar({ clubId, clubName, username }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const basePath = `/clubs/${clubId}`;

    const isActive = (href: string) => {
        const fullPath = `${basePath}${href}`;
        return pathname === fullPath || pathname.startsWith(fullPath + '/');
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}>🏀</span>
                        {!isCollapsed && <span className={styles.logoText}>Basketball</span>}
                    </Link>
                    <button
                        className={styles.toggleBtn}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                </div>

                {!isCollapsed && (
                    <div className={styles.clubInfo}>
                        <div className={styles.clubName}>{clubName}</div>
                    </div>
                )}

                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={`${basePath}${item.href}`}
                            className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    {!isCollapsed && username && (
                        <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className={styles.username}>{username}</span>
                        </div>
                    )}
                    <form action={logout}>
                        <button type="submit" className={styles.logoutBtn} title="로그아웃">
                            <span className={styles.navIcon}>🚪</span>
                            {!isCollapsed && <span>로그아웃</span>}
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className={styles.mobileNav}>
                {menuItems.slice(0, 5).map((item) => (
                    <Link
                        key={item.href}
                        href={`${basePath}${item.href}`}
                        className={`${styles.mobileNavItem} ${isActive(item.href) ? styles.active : ''}`}
                    >
                        <span className={styles.mobileNavIcon}>{item.icon}</span>
                        <span className={styles.mobileNavLabel}>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
