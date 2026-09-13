import { GoogleGenAI } from '@google/genai'

let client: GoogleGenAI | null = null
const GEMINI_MODEL_CANDIDATES = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite']

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined')
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey })
  }
  return client
}

export function getGeminiModelCandidates(): string[] {
  return [...GEMINI_MODEL_CANDIDATES]
}

export async function resolveGeminiModelName(): Promise<string> {
  const ai = getGeminiClient()
  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      await ai.models.generateContent({ model, contents: 'ping' })
      return model
    } catch {
      // Try next available Gemini variant; the fallback route remains safe if none work.
    }
  }
  return GEMINI_MODEL_CANDIDATES[0]
}

export function detectLanguage(prompt: string, preferredLanguage?: string): 'English' | 'Hindi' | 'Gujarati' {
  const normalized = (prompt || '').toLowerCase()
  if (preferredLanguage === 'ગુજરાતી' || /[ા-૿]/.test(prompt) || /ની|જોઈ|શુ|ચે|હવે|માહિતી|બિલકુલ|પર|સહાય|એક|પાત્ર|આ|ખર્ચ|લોન/.test(normalized)) {
    return 'Gujarati'
  }
  if (preferredLanguage === 'हिन्दी' || /\b(क्या|कब|कैसे|लोन|फीस|पीएम|किसान|सुरक्षित|खर्च|राशि|कर्ज|अवश्यक|दस्तावेज)\b/.test(normalized) || /[\u0900-\u097F]/.test(prompt)) {
    return 'Hindi'
  }
  return 'English'
}

export function createGroundedFallbackResponse(
  prompt: string,
  options: { language?: string; financialContext?: { currentBalance?: number; safeToSpend?: number } } = {},
): { replyText: string; intentAction: null } {
  const q = (prompt || '').trim()
  const language = detectLanguage(q, options.language)
  const currentBalance = options.financialContext?.currentBalance ?? 124580
  const safeToSpend = options.financialContext?.safeToSpend ?? 42580

  const localized = (englishText: string, hindiText: string, gujaratiText: string) => {
    if (language === 'Hindi') return hindiText
    if (language === 'Gujarati') return gujaratiText
    return englishText
  }

  if (!q) {
    return {
      replyText: localized(
        'I do not have a usable financial question yet. Please ask about EMI, PM Kisan, loan documents, or budgeting.',
        'मेरे पास अभी कोई उपयोगी वित्तीय सवाल नहीं है। EMI, PM Kisan, लोन दस्तावेज़ या बजट के बारे में पूछें।',
        'મારી પાસે હજી કોઈ ઉપયોગી фінાન્સ પર પ્રશ્ન નથી. EMI, PM Kisan, લોન દસ્તાવેજો અથવા বাজેટ વિશે પૂછો.'
      ),
      intentAction: null,
    }
  }

  const lower = q.toLowerCase()

  if (/emi|equated monthly installment|monthly installment/.test(lower)) {
    return {
      replyText: localized(
        'EMI stands for Equated Monthly Installment. It is the fixed monthly payment used to repay a loan, usually covering both principal and interest. The exact EMI depends on the loan amount, interest rate, tenure, and any processing fees.',
        'EMI का मतलब Equated Monthly Installment है। यह एक निश्चित मासिक भुगतान है जिसका उपयोग लोन चुकाने के लिए किया जाता है, और इसमें मूलधन और ब्याज दोनों शामिल होते हैं। EMI का सही मूल्य लोन राशि, ब्याज दर, अवधि और प्रोसेसिंग फीस पर निर्भर करता है।',
        'EMIનો અર્થ Equated Monthly Installment છે. તે એક નક્કી માસિક ચુકવણી છે જે લોન ચૂકવવા માટે ઉપયોગમાં લેવાય છે અને જેમાં મુખ્ય રકમ અને વ્યાજ બંને શામેલ હોય છે. EMIની ચોક્કસ રકમ લોન રકમ, ब्यાજ રેટ, મુદત અને પ્રક્રિયા ફી પર આધારિત હોય છે.'
      ),
      intentAction: null,
    }
  }

  if (/pm kisan|pradhan mantri kisan|kisan yojana|pmkishan/.test(lower)) {
    return {
      replyText: localized(
        'PM-Kisan is a central government income support scheme for eligible small and marginal farmer families. I can help with general eligibility and document questions, but I cannot guarantee approval without the official scheme rules or your latest KYC details.',
        'PM-Kisan केंद्र सरकार की एक किसान आय सहायता योजना है, जो योग्य छोटे और सीमांत किसान परिवारों को सहायता देती है। मैं सामान्य पात्रता और दस्तावेज़ संबंधी सवालों में मदद कर सकता हूँ, लेकिन आधिकारिक योजना नियमों या आपके नवीनतम KYC विवरण के बिना मान्यता की गारंटी नहीं दे सकता।',
        'PM-Kisan કેન્દ્ર સરકારની એક ખેડૂતોની આવક સહાયક યોજના છે જે યોગ્ય નાના અને marginal ખેડૂતોના પરિવારને સહાય આપે છે. હું સામાન્ય પાત્રતા અને દસ્તાવેજ સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું, પરંતુ આ૫ધિકરીય યોજનાના નિયમો અથવા તમારા તાજા KYC ਵੇતાર sans sansગીરી આપવાની ગેરંટી આપી શકતો નથી.'
      ),
      intentAction: null,
    }
  }

  if (/banking fraud|fraud|phishing|scam|fake call|upi fraud|credit card fraud|loan scam/.test(lower)) {
    return {
      replyText: localized(
        'If you suspect banking fraud, stop sharing OTPs, PAN, or UPI PIN, block the card or account immediately if needed, and report the transaction through your bank or the official cybercrime helpline. I can help explain safe steps, but I cannot verify an active fraud case without your live account details.',
        'यदि आपको बैंकिंग धोखाधड़ी का संदेह है, तो OTP, PAN या UPI PIN साझा करना बंद करें, आवश्यक हो तो कार्ड या खाता तुरंत ब्लॉक करें, और लेन-देन की रिपोर्ट अपने बैंक या आधिकारिक साइबर अपराध हेल्पलाइन के माध्यम से करें। मैं सुरक्षित कदम समझाने में मदद कर सकता हूँ, लेकिन लाइव खाते के विवरण के बिना सक्रिय धोखाधड़ी का सत्यापन नहीं कर सकता।',
        'જો તમને બેંકિંગ છેતરપિંડીનો શંકા હોય તો OTP, PAN અથવા UPI PIN શેર કરવાનું બંધ કરો, જરૂરી હોય તો કાર્ડ અથવા એકાઉન્ટ તાત્કાલિક બ્લોક કરો, અને વ્યવહારનો અહેવાલ તમારા બેંક અથવા સત્તાવાર સાઇબર ક્રાઇમ હેલ્પલાઇન દ્વારા કરો. હું સુરક્ષિત પગલાં સમજાવા માટે મદદ કરી શકું છું, પરંતુ જારી એકાઉન્ટ વિગતો વિના સક્રિય છેતરપિંડીની પુષ્ટિ કરી શકતો નથી.'
      ),
      intentAction: null,
    }
  }

  if ((/loan.*document|documents.*loan|dastavej|document.*loan|loan mate|loan.*kya|loan.*documents|documents.*koi/.test(lower)) || (/aadhar|pan|salary slip|bank statement|address proof/.test(lower))) {
    return {
      replyText: localized(
        `For most personal loan or scheme-related document checks, common documents are identity proof, address proof, PAN, bank statements, income proof, and recent photographs. The exact list depends on the lender or scheme. I can help you prepare the right set, but do not rely on this as a final official requirement list.`,
        `अधिकांश पर्सनल लोन या योजना-संबंधी दस्तावेज़ जाँच के लिए सामान्य दस्तावेज़ पहचान प्रमाण, पता प्रमाण, PAN, बैंक स्टेटमेंट, इनकम प्रमाण और हाल की तस्वीरें होती हैं। सटीक सूची लेंडर या योजना के आधार पर अलग हो सकती है। मैं सही सेट तैयार करने में मदद कर सकता हूँ, लेकिन यह अंतिम आधिकारिक आवश्यकता सूची नहीं है।`,
        `બહેતર વ્યક્તિગત લોન અથવા યોજનાપ્રતિબંધિત દસ્તાવેજ તપાસ માટે સામાન્ય દસ્તાવેજો ઓળખ પુરાવો, સરનામું પુરાવો, PAN, બેંક સ્ટેટમેન્ટ, આવક પુરાવો અને તાજેતરની ફોટો હોય છે. ચોક્કસ યાદી લેનર અથવા યોજનાના આધારે અલગ હોઈ શકે છે. હું યોગ્ય સેટ તૈયાર કરવામાં મદદ કરી શકું છું, પરંતુ આ અંતિમ સત્તાવાર જરૂરિયાત યાદી તરીકે ઉપયોગ ન કરવું.`
      ),
      intentAction: null,
    }
  }

  if (/(safe.*spend|spend today|how much can i spend|safe to spend|spend.*limit)/.test(lower)) {
    return {
      replyText: localized(
        `Based on the current demo balance and commitments, your available safe-to-spend is around ₹${safeToSpend.toLocaleString('en-IN')}. Your liquid balance is ₹${currentBalance.toLocaleString('en-IN')}. This is a planning estimate, not a guaranteed spend limit for a live bank account.`,
        `वर्तमान डेमो बैलेंस और कमिटमेंट्स के आधार पर आपकी सुरक्षित खर्च सीमा लगभग ₹${safeToSpend.toLocaleString('en-IN')} है। आपका तरल बैलेंस ₹${currentBalance.toLocaleString('en-IN')} है। यह एक योजना अनुमान है, न कि लाइव बैंक खाते के लिए गारंटीकृत खर्च सीमा।`,
        `વર્તમાન ડેમો બેલન્સ અને કમીટમેન્ટ્સના આધારે તમારી સુરક્ષિત ખર્ચ સીમા આશરે ₹${safeToSpend.toLocaleString('en-IN')} છે. તમારી લિક્વિડ બેલન્સ ₹${currentBalance.toLocaleString('en-IN')} છે. આ આયોજનનો અંદાજ છે, જીવંત બેંક એકાઉન્ટ માટે ગેરંટીવાળું ખર્ચ limt નથી.`
      ),
      intentAction: null,
    }
  }

  if (/weather|stock|bitcoin|ipl|cricket|movie|travel|random/.test(lower)) {
    return {
      replyText: localized(
        'I do not have enough information in my current knowledge base to answer that reliably. I can help with financial planning, EMI, fraud safety, PM-Kisan, and loan-document guidance.',
        'मेरे वर्तमान ज्ञान आधार में इस सवाल का भरोसेमंद उत्तर देने के लिए पर्याप्त जानकारी नहीं है। मैं वित्तीय योजना, EMI, धोखाधड़ी सुरक्षा, PM-Kisan और लोन-दस्तावेज़ मार्गदर्शन में मदद कर सकता हूँ।',
        'મારી વર્તમાન નાણાકીય જ્ઞાનકોશમાં આ પ્રશ્નનો વિશ્વાસપાત્ર જવાબ આપવા માટે પૂરતી માહિતી નથી. હું ფინანსીય આયોજન, EMI, છેતરપિંડી સુરક્ષા, PM-Kisan અને લોન દસ્તાવેજ માર્ગદર્શનમાં મદદ કરી શકું છું.'
      ),
      intentAction: null,
    }
  }

  return {
    replyText: localized(
      "I don't have enough information in my current knowledge base to answer that reliably. I can help with EMI, PM-Kisan, loan documents, budgeting, and fraud-safety questions.",
      'मेरे वर्तमान ज्ञान आधार में इस सवाल का भरोसेमंद उत्तर देने के लिए पर्याप्त जानकारी नहीं है। मैं EMI, PM-Kisan, लोन दस्तावेज़, बजट और धोखाधड़ी सुरक्षा के सवालों में मदद कर सकता हूँ।',
      'મારી વર્તમાન જ્ઞાનકોશમાં આ પ્રશ્નનો વિશ્વાસપાત્ર જવાબ આપવા માટે પૂરતી માહિતી નથી. હું EMI, PM-Kisan, લોન દસ્તાવેજો, বাজેટ અને છેતરપિંડી સુરક્ષા સંબંધિત પ્રશ્નોમાં મદદ કરી શકું છું.'
    ),
    intentAction: null,
  }
}

