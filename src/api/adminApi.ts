import axiosClient from './axiosClient'
import type { ApiResponse } from '@/types/auth'
import type {
  AiGenerationParams,
  AiGenerationResult,
  PoolCoverage,
  GeneratorRunResult,
  QuestionGeneratorParams,
  QuestionBankPageResponse,
  QuestionBankStats,
  QuestionBankQueryParams,
  QuestionBankItem,
  QuestionUpdateRequest,
} from '@/types/admin'

/**
 * 1. Chạy sinh câu hỏi (Generator UI) - Chế độ dry-run hoặc import
 */
export const runQuestionGenerator = async (
  params: QuestionGeneratorParams
): Promise<GeneratorRunResult> => {
  const response = await axiosClient.post<ApiResponse<GeneratorRunResult>>(
    '/admin/question-generator/run',
    params
  )
  return response.data.data
}

/**
 * 2. Phê duyệt câu hỏi hàng loạt theo Cấp và Loại
 */
export const bulkPublishQuestions = async (
  levelCode?: string,
  questionType?: string
): Promise<{ publishedCount: number }> => {
  const response = await axiosClient.post<ApiResponse<{ publishedCount: number }>>(
    '/admin/question-generator/publish',
    null,
    {
      params: { levelCode, questionType },
    }
  )
  return response.data.data
}

/**
 * 3. Lấy thống kê ngân hàng câu hỏi
 */
export const getQuestionBankStats = async (): Promise<QuestionBankStats> => {
  const response = await axiosClient.get<ApiResponse<QuestionBankStats>>(
    '/admin/question-bank/stats'
  )
  return response.data.data
}

/**
 * 4. Lấy danh sách câu hỏi có phân trang và bộ lọc
 */
export const getQuestionBankItems = async (
  params?: QuestionBankQueryParams
): Promise<QuestionBankPageResponse> => {
  const response = await axiosClient.get<ApiResponse<QuestionBankPageResponse>>(
    '/admin/question-bank/items',
    { params }
  )
  return response.data.data
}

/**
 * 5. Phê duyệt (Publish) một câu hỏi đơn lẻ
 */
export const publishQuestionItem = async (id: number): Promise<void> => {
  await axiosClient.post<ApiResponse<string>>(`/admin/question-bank/items/${id}/publish`)
}

/**
 * 6. Chỉnh sửa nội dung / phương án của câu hỏi
 */
export const updateQuestionItem = async (
  id: number,
  data: QuestionUpdateRequest
): Promise<QuestionBankItem> => {
  const response = await axiosClient.put<ApiResponse<QuestionBankItem>>(
    `/admin/question-bank/items/${id}`,
    data
  )
  return response.data.data
}

/**
 * 7. Xóa câu hỏi khỏi ngân hàng
 */
export const deleteQuestionItem = async (id: number): Promise<void> => {
  await axiosClient.delete<ApiResponse<string>>(`/admin/question-bank/items/${id}`)
}


/** Asks Gemini for a batch of questions; the usable ones are saved as DRAFT. */
export const generateQuestionsWithAi = async (params: AiGenerationParams): Promise<AiGenerationResult> => {
  const response = await axiosClient.post<ApiResponse<AiGenerationResult>>('/admin/question-generator/ai', params)
  return response.data.data
}

/** Published questions per level band and skill against the target the placement test needs. */
export const getPoolCoverage = async (): Promise<PoolCoverage> => {
  const response = await axiosClient.get<ApiResponse<PoolCoverage>>('/admin/question-bank/pool-coverage')
  return response.data.data
}

/** Moves a question between DRAFT, PUBLISHED and RETIRED. */
export const changeQuestionStatus = async (
  id: number,
  action: 'reject' | 'activate' | 'deactivate',
): Promise<void> => {
  await axiosClient.post<ApiResponse<string>>(`/admin/question-bank/items/${id}/${action}`)
}
