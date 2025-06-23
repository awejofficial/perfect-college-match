
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
}

export interface StudentProfile {
  fullName: string;
  aggregate: number;
  category: string;
  preferredBranch: string;
  preferredCities: string[];
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
const VALID_CATEGORIES = ['EWS', 'GOPEN'];

export const analyzeCollegeOptions = async (
  studentProfile: StudentProfile,
  cutoffData: {
    round1?: string;
    round2?: string;
    round3?: string;
  } = {}
): Promise<CollegeMatch[]> => {
  try {
    // Validate category
    if (!VALID_CATEGORIES.includes(studentProfile.category)) {
      console.log('Invalid category. Only EWS and GOPEN are supported.');
      return [];
    }

    // Validate branch
    if (!VALID_BRANCHES.includes(studentProfile.preferredBranch)) {
      console.log('Invalid branch. Only CS/IT/AI branches are supported.');
      return [];
    }

    const availableRounds = Object.keys(cutoffData).filter(key => cutoffData[key as keyof typeof cutoffData]);
    
    const prompt = `
You are an expert DSE admission counselor for Maharashtra. Analyze 2024 CAP Round cutoffs.

Student Profile:
- Name: ${studentProfile.fullName}
- Percentage: ${studentProfile.aggregate}%
- Category: ${studentProfile.category} (Only EWS/GOPEN allowed)
- Preferred Branch: ${studentProfile.preferredBranch}

STRICT FILTERING RULES:
1. Show ONLY EWS and GOPEN category cutoffs
2. Show ONLY these branches: Computer Engineering, Computer Science and Engineering, Computer Science and Engineering (Data Science), Information Technology, Artificial Intelligence and Data Science, Artificial Intelligence (AI) and Data Science
3. Compare student percentage (${studentProfile.aggregate}%) with cutoff
4. Mark eligible: true if student percentage >= cutoff, false otherwise
5. Include colleges from ALL cities in Maharashtra
6. Show results for available rounds only: ${availableRounds.join(', ')}

Available Cutoff Data:
${Object.entries(cutoffData).map(([round, data]) => data ? `${round}: Available` : '').filter(Boolean).join('\n')}

Return ONLY a JSON array in this exact format:
[
  {
    "collegeName": "College Name",
    "city": "City Name", 
    "branch": "${studentProfile.preferredBranch}",
    "category": "${studentProfile.category}",
    "round": "I",
    "cutoff": 85.5,
    "eligible": true
  }
]

Sort by: Government colleges first, then by eligibility (eligible first), then by cutoff (lower first).
If no colleges match, return empty array [].
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
      return generateMockColleges(studentProfile);
    }

  } catch (error) {
    console.error('DeepSeek API error:', error);
    return generateMockColleges(studentProfile);
  }
};

// Enhanced mock data for CS/IT/AI branches with eligibility
const generateMockColleges = (studentProfile: StudentProfile): CollegeMatch[] => {
  // Validate inputs for mock data
  if (!VALID_CATEGORIES.includes(studentProfile.category) || 
      !VALID_BRANCHES.includes(studentProfile.preferredBranch)) {
    return [];
  }

  const mockColleges = [
    {
      collegeName: "Government College of Engineering, Pune",
      city: "Pune",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "I",
      cutoff: 85.5,
      eligible: studentProfile.aggregate >= 85.5
    },
    {
      collegeName: "Government College of Engineering, Pune", 
      city: "Pune",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "II",
      cutoff: 83.2,
      eligible: studentProfile.aggregate >= 83.2
    },
    {
      collegeName: "Veermata Jijabai Technological Institute, Mumbai",
      city: "Mumbai", 
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "I",
      cutoff: 88.5,
      eligible: studentProfile.aggregate >= 88.5
    },
    {
      collegeName: "Veermata Jijabai Technological Institute, Mumbai",
      city: "Mumbai",
      branch: studentProfile.preferredBranch, 
      category: studentProfile.category,
      round: "II",
      cutoff: 86.3,
      eligible: studentProfile.aggregate >= 86.3
    },
    {
      collegeName: "Pune Institute of Computer Technology (PICT)",
      city: "Pune",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "I", 
      cutoff: 84.7,
      eligible: studentProfile.aggregate >= 84.7
    },
    {
      collegeName: "Pune Institute of Computer Technology (PICT)",
      city: "Pune",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "II",
      cutoff: 82.5,
      eligible: studentProfile.aggregate >= 82.5
    },
    {
      collegeName: "Government College of Engineering, Nagpur",
      city: "Nagpur",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "I",
      cutoff: 82.0,
      eligible: studentProfile.aggregate >= 82.0
    },
    {
      collegeName: "Government College of Engineering, Nagpur",
      city: "Nagpur", 
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      round: "II",
      cutoff: 80.5,
      eligible: studentProfile.aggregate >= 80.5
    }
  ];

  // Sort by government colleges first, then eligible first, then by cutoff
  return mockColleges.sort((a, b) => {
    // Government colleges first
    const aIsGovt = a.collegeName.toLowerCase().includes('government');
    const bIsGovt = b.collegeName.toLowerCase().includes('government');
    if (aIsGovt && !bIsGovt) return -1;
    if (!aIsGovt && bIsGovt) return 1;
    
    // Eligible first
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    
    // Lower cutoff first (easier to get into)
    return a.cutoff - b.cutoff;
  });
};
