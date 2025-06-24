
const DEEPSEEK_API_KEY = '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';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface CollegeMatch {
  collegeName: string;
  city: string;
  branch: string;
  category: string;
  round: string;
  cutoff: number;
  eligible: boolean;
  collegeType: string;
}

export interface StudentProfile {
  fullName: string;
  aggregate: number;
  category: string;
  preferredBranch: string;
  preferredCities: string[];
  collegeTypes?: string[];
}

// Valid branches for CS/IT/AI focus
const VALID_BRANCHES = [
  'Computer Engineering',
  'Computer Science and Engineering',
  'Computer Science and Engineering (Data Science)',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Artificial Intelligence (AI) and Data Science'
];

// Valid categories
const VALID_CATEGORIES = ['EWS', 'GOPEN', 'SC', 'ST', 'OBC'];

// Valid college types
const VALID_COLLEGE_TYPES = ['Government', 'Government Autonomous', 'Private'];

export const analyzeCollegeOptions = async (
  studentProfile: StudentProfile,
  cutoffData: any[] = []
): Promise<CollegeMatch[]> => {
  try {
    // Validate category
    if (!VALID_CATEGORIES.includes(studentProfile.category)) {
      console.log('Invalid category. Supported categories:', VALID_CATEGORIES);
      return [];
    }

    // Validate branch
    if (!VALID_BRANCHES.includes(studentProfile.preferredBranch)) {
      console.log('Invalid branch. Only CS/IT/AI branches are supported.');
      return [];
    }

    // If no cutoff data is provided, return empty array
    if (!cutoffData || cutoffData.length === 0) {
      console.log('No cutoff data available');
      return [];
    }

    const prompt = `
You are an expert DSE admission counselor for Maharashtra. Analyze cutoff data from the uploaded database.

Student Profile:
- Name: ${studentProfile.fullName}
- Percentage: ${studentProfile.aggregate}%
- Category: ${studentProfile.category}
- Preferred Branch: ${studentProfile.preferredBranch}
- College Types: ${studentProfile.collegeTypes?.join(', ') || 'All types'}

STRICT FILTERING RULES:
1. Use ONLY the provided cutoff data - NO external or mock data
2. Filter by student's exact category: ${studentProfile.category}
3. Filter by preferred branch: ${studentProfile.preferredBranch}
4. Compare student percentage (${studentProfile.aggregate}%) with cutoff
5. Mark eligible: true if student percentage >= cutoff, false otherwise
6. Include college type information
7. Sort by: Government colleges first, then eligible first, then by cutoff (lower first)

Available Cutoff Data:
${JSON.stringify(cutoffData.slice(0, 100))} // Limit to prevent token overflow

Return ONLY a JSON array in this exact format:
[
  {
    "collegeName": "College Name",
    "city": "City Name", 
    "branch": "${studentProfile.preferredBranch}",
    "category": "${studentProfile.category}",
    "round": "I",
    "cutoff": 85.5,
    "eligible": true,
    "collegeType": "Government"
  }
]

If no colleges match the criteria, return empty array [].
Return ONLY JSON, no explanatory text.
`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    try {
      const colleges = JSON.parse(aiResponse);
      return Array.isArray(colleges) ? colleges : [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      return [];
    }

  } catch (error) {
    console.error('DeepSeek API error:', error);
    return [];
  }
};
