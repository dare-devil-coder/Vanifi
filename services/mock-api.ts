// Vani-Fi Mock Service Layer
// Provides clean asynchronous promises with simulated network latency to power loading and success states.

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function verifyOtp(otp: string): Promise<{ success: boolean; message: string }> {
  await delay(450)
  if (otp.length === 6) {
    return { success: true, message: 'OTP verified successfully' }
  }
  throw new Error('Invalid OTP. Please enter the 6-digit verification code.')
}

export async function connectAccount(accountNumber: string): Promise<{ success: boolean; institution: string }> {
  await delay(600)
  return { success: true, institution: 'HDFC Bank Salary Account' }
}

export async function createCommitmentService(commitment: any): Promise<{ success: boolean; data: any }> {
  await delay(350)
  return { success: true, data: commitment }
}

export async function updateCommitmentService(id: string, updates: any): Promise<{ success: boolean }> {
  await delay(300)
  return { success: true }
}

export async function deleteCommitmentService(id: string): Promise<{ success: boolean }> {
  await delay(300)
  return { success: true }
}

export async function addMoneyService(amount: number, source: string): Promise<{ success: boolean; txId: string }> {
  await delay(400)
  return { success: true, txId: `TX-${Date.now()}` }
}

export async function transferMoneyService(
  amount: number,
  recipient: string,
  note: string
): Promise<{ success: boolean; refId: string }> {
  await delay(500)
  return { success: true, refId: `UPI-${Math.floor(100000 + Math.random() * 900000)}` }
}

export async function submitLoanApplicationService(data: any): Promise<{
  success: boolean
  applicationId: string
  status: string
}> {
  await delay(650)
  return {
    success: true,
    applicationId: `VF-LN-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'UNDER_STATUTORY_REVIEW',
  }
}

export async function updateConsentService(preferences: Record<string, boolean>): Promise<{ success: boolean }> {
  await delay(350)
  return { success: true }
}

export async function updateProfileService(profile: any): Promise<{ success: boolean }> {
  await delay(400)
  return { success: true }
}
