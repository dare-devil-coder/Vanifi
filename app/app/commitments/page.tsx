'use client'

import React, { useState } from 'react'
import { Plus, ChevronRight, ShieldCheck, Calendar, Info } from 'lucide-react'
import { useFinancial, Commitment } from '@/lib/financial-context'
import { AddCommitmentModal } from '@/components/modals/add-commitment-modal'
import { EditCommitmentModal } from '@/components/modals/edit-commitment-modal'
import { DeleteCommitmentModal } from '@/components/modals/delete-commitment-modal'
import { CommitmentDetailsModal } from '@/components/modals/commitment-details-modal'

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

export default function CommitmentsPage() {
  const { commitments, totalUpcomingCommitments, safeToSpend } = useFinancial()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const totalSaved = commitments.reduce((sum, c) => sum + c.savedAmount, 0)
  const percentFunded = totalUpcomingCommitments > 0
    ? Math.min(100, Math.round((totalSaved / totalUpcomingCommitments) * 100))
    : 0

  const handleOpenDetails = (c: Commitment) => {
    setSelectedCommitment(c)
    setIsDetailsOpen(true)
  }

  const handleOpenEdit = (c: Commitment) => {
    setSelectedCommitment(c)
    setIsEditOpen(true)
  }

  const handleOpenDelete = (c: Commitment) => {
    setSelectedCommitment(c)
    setIsDeleteOpen(true)
  }

  return (
    <>
      {/* Intro Header */}
      <section className="commitment-intro">
        <div>
          <span className="soft-label">PLAN AHEAD, FEEL LIGHTER</span>
          <h2>Your future, made visible.</h2>
          <p>
            When you tell Vani what expenses are coming up, it reserves funds virtually so your Safe-to-Spend limit is never caught by surprise.
          </p>
        </div>

        <button
          className="button teal-button"
          onClick={() => setIsAddOpen(true)}
          id="btn-add-commitment"
        >
          <Plus size={16} /> Add commitment
        </button>
      </section>

      {/* Commitments Summary & Virtual Protection Card */}
      <div className="commitment-total panel">
        <div>
          <span className="soft-label">NEXT 90 DAYS TOTAL</span>
          <h3>₹{totalUpcomingCommitments.toLocaleString('en-IN')}</h3>
          <p>Across {commitments.length} planned future expenses</p>
        </div>

        <div>
          <div className="commitment-bar">
            <span style={{ width: `${percentFunded}%` }} />
          </div>
          <div className="bar-labels">
            <span>₹{totalSaved.toLocaleString('en-IN')} earmarked</span>
            <span>{percentFunded}% funded</span>
          </div>
        </div>

        <div className="safe-spend-callout">
          <small>Safe-to-Spend:</small>
          <strong>₹{safeToSpend.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {/* Prominent Virtual Protection Disclaimer */}
      <div className="virtual-disclaimer-banner">
        <ShieldCheck size={20} className="teal" />
        <div>
          <strong>Your commitments are virtual.</strong>
          <span>Vani-Fi never moves or withdraws this money automatically. You retain 100% control of your bank balance.</span>
        </div>
      </div>

      {/* Commitments List */}
      <div className="commitment-list">
        {commitments.length === 0 ? (
          <div className="empty-commitments-card panel">
            <CalendarIcon width={32} height={32} />
            <h3>No upcoming commitments registered</h3>
            <p>Add your rent, fees, or insurance premium to keep your safe-to-spend limit accurate.</p>
            <button className="button teal-button" onClick={() => setIsAddOpen(true)}>
              <Plus size={16} /> Add your first commitment
            </button>
          </div>
        ) : (
          commitments.map((c, i) => (
            <div
              className="commitment-row panel clickable"
              key={c.id}
              onClick={() => handleOpenDetails(c)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') handleOpenDetails(c)
              }}
            >
              <div className={`commitment-icon c${i % 3}`}>
                <CalendarIcon width={18} height={18} />
              </div>

              <div className="commitment-info">
                <div className="title-row">
                  <b>{c.title}</b>
                  <span className="mini-badge">{c.priority}</span>
                </div>
                <span>
                  Due: {c.dueDate} · {c.category} · Earmarked: ₹{c.savedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <strong>₹{c.amount.toLocaleString('en-IN')}</strong>

              <button
                className="arrow-button"
                onClick={e => {
                  e.stopPropagation()
                  handleOpenDetails(c)
                }}
                aria-label={`View details for ${c.title}`}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Real Functional Modals */}
      <AddCommitmentModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditCommitmentModal
        commitment={selectedCommitment}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
      <DeleteCommitmentModal
        commitment={selectedCommitment}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
      />
      <CommitmentDetailsModal
        commitment={selectedCommitment}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />
    </>
  )
}
