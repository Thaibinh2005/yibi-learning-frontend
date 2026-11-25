import axiosClient from './axiosClient'
import type { ReportReason, ReportTarget } from '@/types/adminOps'

/** A learner reports a mistake; `targetRef` is the sentence index of a listening line. */
export const reportContent = async (report: {
  targetType: ReportTarget
  targetId: number
  targetRef?: number
  reason: ReportReason
  note?: string
}): Promise<void> => {
  await axiosClient.post('/reports', report)
}
