'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Sparkles, ShieldCheck, Check, ArrowRight } from 'lucide-react'
import { useFinancial, NotificationItem } from '@/lib/financial-context'

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    markAllNotificationsRead,
    markNotificationRead,
  } = useFinancial()

  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const displayedList = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    return true
  })

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationRead(item.id)
    if (item.link) {
      router.push(item.link)
    }
  }

  const getIcon = (category: NotificationItem['category']) => {
    if (category === 'savings') return <Sparkles size={18} />
    if (category === 'commitment') return <CalendarIcon width={18} height={18} />
    if (category === 'security') return <ShieldCheck size={18} />
    return <Bell size={18} />
  }

  return (
    <>
      <section className="section-heading">
        <div>
          <span className="soft-label">ACTIVITY & ALERTS</span>
          <h2>Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</h2>
        </div>

        <div className="notif-actions-row">
          <div className="filter-row">
            <button
              className={`filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button className="text-link" onClick={markAllNotificationsRead}>
              Mark all as read
            </button>
          )}
        </div>
      </section>

      <div className="notification-list">
        {displayedList.length === 0 ? (
          <div className="empty-state-card panel">
            <Bell size={28} className="muted" />
            <p>No notifications to display in this view.</p>
          </div>
        ) : (
          displayedList.map(item => (
            <div
              key={item.id}
              className={`notice panel ${!item.read ? 'new' : ''} clickable`}
              onClick={() => handleNotificationClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(item)
              }}
            >
              <div className="notice-icon">{getIcon(item.category)}</div>
              <div>
                <b>{item.title}</b>
                <p>{item.text}</p>
                <span>{item.time}</span>
              </div>
              {!item.read && <i className="unread-dot" title="Unread" />}
              {item.link && (
                <div className="notice-link-arrow">
                  <ArrowRight size={15} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  )
}
