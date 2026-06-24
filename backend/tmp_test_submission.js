const api = 'http://localhost:5000';

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(api + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

(async () => {
  try {
    const register = await request('POST', '/api/auth/register', {
      username: 'testuser1',
      email: 'testuser1@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    let token;
    if (register.ok) {
      console.log('Register success');
      token = register.data.token;
    } else if (register.status === 400 && register.data && register.data.message && register.data.message.includes('User already exists')) {
      console.log('User already exists; logging in');
      const login = await request('POST', '/api/auth/login', {
        email: 'testuser1@example.com',
        password: 'password123',
      });
      if (!login.ok) {
        console.error('Login failed', login);
        process.exit(1);
      }
      token = login.data.token;
    } else {
      console.error('Register failed', register);
      process.exit(1);
    }

    const challenges = await request('GET', '/api/challenges', null, token);
    console.log('Challenges status', challenges.status);
    if (!Array.isArray(challenges.data) || challenges.data.length === 0) {
      console.error('No challenges available', challenges.data);
      process.exit(1);
    }

    const unlockedChallenge = challenges.data.find(ch => ch.title === 'Two Sum');
    if (!unlockedChallenge) {
      console.error('Two Sum challenge not found');
      process.exit(1);
    }

    console.log('Using challenge', unlockedChallenge.title, 'unlocked:', unlockedChallenge.isUnlocked, 'difficulty:', unlockedChallenge.difficulty);
    const challengeId = unlockedChallenge._id || unlockedChallenge.id;

    const code = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Hash map to store: { value: index }
        seen = {}
        
        for index, num in enumerate(nums):
            complement = target - num
            
            # If the complement exists in our map, we found the pair
            if complement in seen:
                return [seen[complement], index]
                
            # Otherwise, store the current number and its index
            seen[num] = index
            
        return [] # Return an empty list if no solution is found
`;
    const submission = await request('POST', '/api/submissions', { challengeId, code, language: 'python' }, token);
    console.log('Submission response', JSON.stringify(submission, null, 2));
  } catch (err) {
    console.error('Error in test script', err);
    process.exit(1);
  }
})();
