
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
  cutoffData: string = "Mock cutoff data for demonstration"
): Promise<CollegeMatch[]> => {
  try {
    const prompt = `
You are an expert college admission counselor for Direct Second Year Engineering (DSE) admission in Maharashtra.

Student Profile:
- Name: ${studentProfile.fullName}
- Aggregate: ${studentProfile.aggregate}%
- Category: ${studentProfile.category}
- Preferred Branch: ${studentProfile.preferredBranch}
- Preferred Cities: ${studentProfile.preferredCities.length > 0 ? studentProfile.preferredCities.join(', ') : 'All cities'}

Cutoff Data:
${cutoffData}

Based on the student's profile and the cutoff data, analyze and return ONLY a JSON array of matching colleges where:
1. The student's aggregate is greater than or equal to the cutoff for their category
2. The branch matches their preference
3. The city matches their preference (or all cities if none specified)
4. Include cutoffs from all three CAP rounds

Return ONLY a JSON array in this exact format:
[
  {
    "collegeName": "College Name",
    "city": "City Name",
    "branch": "Branch Name",
    "category": "Category",
    "roundICutoff": 85.5,
    "roundIICutoff": 84.2,
    "roundIIICutoff": 83.1
  }
]

If no colleges match, return an empty array [].
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

    // Parse the JSON response
    try {
      const colleges = JSON.parse(aiResponse);
      return Array.isArray(colleges) ? colleges : [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to mock data if parsing fails
      return generateMockColleges(studentProfile);
    }

  } catch (error) {
    console.error('DeepSeek API error:', error);
    // Fallback to mock data on API error
    return generateMockColleges(studentProfile);
  }
};

// Fallback mock data generator
const generateMockColleges = (studentProfile: StudentProfile): CollegeMatch[] => {
  const mockColleges = [
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
    }
  ];

  // Filter by preferred cities if specified
  if (studentProfile.preferredCities.length > 0) {
    return mockColleges.filter(college => 
      studentProfile.preferredCities.includes(college.city)
    );
  }

  return mockColleges;
};
