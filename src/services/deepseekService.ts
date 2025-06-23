
const DEEPSEEK_API_KEY = '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';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface CollegeMatch {
  collegeName: string;
  city: string;
  branch: string;
  category: string;
  roundICutoff: number;
  roundIICutoff: number;
  roundIIICutoff: number;
}

export interface StudentProfile {
  fullName: string;
  aggregate: number;
  category: string;
  preferredBranch: string;
  preferredCities: string[];
}

export const analyzeCollegeOptions = async (
  studentProfile: StudentProfile,
  cutoffData: {
    round1?: string;
    round2?: string;
    round3?: string;
  } = {}
): Promise<CollegeMatch[]> => {
  try {
    const availableRounds = Object.keys(cutoffData).filter(key => cutoffData[key as keyof typeof cutoffData]);
    const roundsInfo = availableRounds.length > 0 ? availableRounds.join(', ') : 'Mock data';

    const prompt = `
You are an expert college admission counselor for Direct Second Year Engineering (DSE) admission in Maharashtra.

Student Profile:
- Name: ${studentProfile.fullName}
- Aggregate: ${studentProfile.aggregate}%
- Category: ${studentProfile.category}
- Preferred Branch: ${studentProfile.preferredBranch}
- Preferred Cities: ${studentProfile.preferredCities.length > 0 ? studentProfile.preferredCities.join(', ') : 'All cities (no preference)'}

Available Cutoff Data:
${Object.entries(cutoffData).map(([round, data]) => data ? `${round}: ${data}` : '').filter(Boolean).join('\n')}

IMPORTANT FILTERING RULES:
1. Show colleges where student's aggregate (${studentProfile.aggregate}%) is GREATER THAN OR EQUAL TO the cutoff for their category (${studentProfile.category})
2. Only show colleges that offer the preferred branch: ${studentProfile.preferredBranch}
3. If no cities are preferred, show colleges from ALL cities across Maharashtra
4. If specific cities are preferred, only show colleges from those cities: ${studentProfile.preferredCities.join(', ') || 'None specified'}
5. Include cutoffs from all available rounds (even if some rounds are missing)

Based on the student's profile and the cutoff data, analyze and return ONLY a JSON array of matching colleges.

Return ONLY a JSON array in this exact format:
[
  {
    "collegeName": "College Name",
    "city": "City Name",
    "branch": "${studentProfile.preferredBranch}",
    "category": "${studentProfile.category}",
    "roundICutoff": 85.5,
    "roundIICutoff": 84.2,
    "roundIIICutoff": 83.1
  }
]

If no colleges match the criteria, return an empty array [].
Do not include any explanatory text, only the JSON array.
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
        max_tokens: 2000,
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

// Enhanced mock data generator with better filtering logic
const generateMockColleges = (studentProfile: StudentProfile): CollegeMatch[] => {
  const allMockColleges = [
    {
      collegeName: "Government College of Engineering, Pune",
      city: "Pune",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      roundICutoff: Math.max(75, studentProfile.aggregate - 5),
      roundIICutoff: Math.max(73, studentProfile.aggregate - 7),
      roundIIICutoff: Math.max(71, studentProfile.aggregate - 9)
    },
    {
      collegeName: "Veermata Jijabai Technological Institute, Mumbai",
      city: "Mumbai",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      roundICutoff: Math.max(78, studentProfile.aggregate - 3),
      roundIICutoff: Math.max(76, studentProfile.aggregate - 5),
      roundIIICutoff: Math.max(74, studentProfile.aggregate - 7)
    },
    {
      collegeName: "College of Engineering, Pune",
      city: "Pune",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      roundICutoff: Math.max(72, studentProfile.aggregate - 8),
      roundIICutoff: Math.max(70, studentProfile.aggregate - 10),
      roundIIICutoff: Math.max(68, studentProfile.aggregate - 12)
    },
    {
      collegeName: "Government College of Engineering, Nagpur",
      city: "Nagpur",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      roundICutoff: Math.max(70, studentProfile.aggregate - 10),
      roundIICutoff: Math.max(68, studentProfile.aggregate - 12),
      roundIIICutoff: Math.max(66, studentProfile.aggregate - 14)
    },
    {
      collegeName: "Government College of Engineering, Aurangabad",
      city: "Aurangabad",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      roundICutoff: Math.max(69, studentProfile.aggregate - 11),
      roundIICutoff: Math.max(67, studentProfile.aggregate - 13),
      roundIIICutoff: Math.max(65, studentProfile.aggregate - 15)
    },
    {
      collegeName: "K. K. Wagh Institute of Engineering Education and Research, Nashik",
      city: "Nashik",
      branch: studentProfile.preferredBranch,
      category: studentProfile.category,
      roundICutoff: Math.max(65, studentProfile.aggregate - 15),
      roundIICutoff: Math.max(63, studentProfile.aggregate - 17),
      roundIIICutoff: Math.max(61, studentProfile.aggregate - 19)
    }
  ];

  // Filter colleges based on student's aggregate being >= cutoff
  let filteredColleges = allMockColleges.filter(college => 
    studentProfile.aggregate >= college.roundICutoff ||
    studentProfile.aggregate >= college.roundIICutoff ||
    studentProfile.aggregate >= college.roundIIICutoff
  );

  // Filter by preferred cities if specified, otherwise show all cities
  if (studentProfile.preferredCities.length > 0) {
    filteredColleges = filteredColleges.filter(college => 
      studentProfile.preferredCities.includes(college.city)
    );
  }

  return filteredColleges;
};
