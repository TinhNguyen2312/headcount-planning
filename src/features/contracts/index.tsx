import React, { useState, useMemo } from "react"
import { message } from "antd"
import { INITIAL_CONTRACTS } from "./data/contractsData"
import {
  ConsultantContract,
  PaymentMilestone,
  ContractVariation,
  ConsultantEvaluation,
} from "./types"
import { ContractsHeader } from "./components/ContractsHeader"
import { ContractsTable } from "./components/ContractsTable"
import { PaymentBatchModal } from "./components/PaymentBatchModal"
import { ContractVariationModal } from "./components/ContractVariationModal"
import { ConsultantEvalModal } from "./components/ConsultantEvalModal"

export const ContractsFeature: React.FC = () => {
  const [contracts, setContracts] = useState<ConsultantContract[]>(INITIAL_CONTRACTS)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("ALL")
  const [selectedDiscipline, setSelectedDiscipline] = useState("ALL")

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isVariationModalOpen, setIsVariationModalOpen] = useState(false)
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<ConsultantContract | null>(null)

  // Filtered List
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchNo = c.contractNo.toLowerCase().includes(query)
        const matchTitle = c.contractTitle.toLowerCase().includes(query)
        const matchPartner = c.consultantName.toLowerCase().includes(query)
        const matchLead = c.leadArchitect.toLowerCase().includes(query)
        if (!matchNo && !matchTitle && !matchPartner && !matchLead) return false
      }

      if (selectedRole !== "ALL" && c.consultantRole !== selectedRole) {
        return false
      }

      if (selectedDiscipline !== "ALL" && c.discipline !== selectedDiscipline) {
        return false
      }

      return true
    })
  }, [contracts, searchTerm, selectedRole, selectedDiscipline])

  // Metrics
  const metrics = useMemo(() => {
    const totalContracts = contracts.length
    const totalValueVnd = contracts.reduce((acc, c) => acc + c.contractValueVnd, 0)
    const totalDisbursedVnd = contracts.reduce((acc, c) => acc + c.disbursedAmountVnd, 0)
    const pendingBatchCount = contracts.reduce(
      (acc, c) => acc + c.milestones.filter((m) => m.status === "SUBMITTED").length,
      0
    )

    return { totalContracts, totalValueVnd, totalDisbursedVnd, pendingBatchCount }
  }, [contracts])

  const handleOpenPayment = (contract: ConsultantContract) => {
    setSelectedContract(contract)
    setIsPaymentModalOpen(true)
  }

  const handleOpenEval = (contract: ConsultantContract) => {
    setSelectedContract(contract)
    setIsEvalModalOpen(true)
  }

  const handleConfirmPayment = (
    contractId: string,
    milestoneId: string,
    invoiceNo: string
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const updatedMilestones = c.milestones.map((m) => {
            if (m.id === milestoneId) {
              return {
                ...m,
                status: "PAID" as const,
                paidDate: new Date().toLocaleDateString("vi-VN"),
                invoiceNo,
              }
            }
            return m
          })

          const newDisbursed = updatedMilestones
            .filter((m) => m.status === "PAID")
            .reduce((sum, m) => sum + m.amountVnd, 0)
          const newRate = Math.round((newDisbursed / c.contractValueVnd) * 100)

          return {
            ...c,
            milestones: updatedMilestones,
            disbursedAmountVnd: newDisbursed,
            disbursementRate: newRate,
            updatedAt: new Date().toLocaleDateString("vi-VN"),
          }
        }
        return c
      })
    )
  }

  const handleAddVariation = (contractId: string, variation: ContractVariation) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const newTotal =
            variation.variationType === "ADDITION"
              ? c.contractValueVnd + variation.amountVnd
              : c.contractValueVnd - variation.amountVnd

          const newRate = Math.round((c.disbursedAmountVnd / newTotal) * 100)

          return {
            ...c,
            contractValueVnd: newTotal,
            disbursementRate: newRate,
            variations: [variation, ...c.variations],
            updatedAt: new Date().toLocaleDateString("vi-VN"),
          }
        }
        return c
      })
    )
  }

  const handleSaveEvaluation = (contractId: string, evaluation: ConsultantEvaluation) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          return {
            ...c,
            evaluations: [evaluation, ...c.evaluations],
            updatedAt: new Date().toLocaleDateString("vi-VN"),
          }
        }
        return c
      })
    )
  }

  return (
    <div className="py-2 space-y-4">
      <ContractsHeader
        totalContracts={metrics.totalContracts}
        totalValueVnd={metrics.totalValueVnd}
        totalDisbursedVnd={metrics.totalDisbursedVnd}
        pendingBatchCount={metrics.pendingBatchCount}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedDiscipline={selectedDiscipline}
        onDisciplineChange={setSelectedDiscipline}
        onOpenCreateVariation={() => setIsVariationModalOpen(true)}
      />

      <ContractsTable
        data={filteredContracts}
        onOpenPaymentModal={handleOpenPayment}
        onOpenEvalModal={handleOpenEval}
      />

      <PaymentBatchModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        contract={selectedContract}
        onConfirmPayment={handleConfirmPayment}
      />

      <ContractVariationModal
        open={isVariationModalOpen}
        onClose={() => setIsVariationModalOpen(false)}
        contracts={contracts}
        onSuccess={handleAddVariation}
      />

      <ConsultantEvalModal
        open={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        contract={selectedContract}
        onSuccess={handleSaveEvaluation}
      />
    </div>
  )
}
