// Automatically fetch test users from database
export async function getTestUsers() {
  try {
    const response = await fetch('/api/test-users');
    if (!response.ok) {
      throw new Error('Failed to fetch test users');
    }
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('Error fetching test users:', error);
    return null;
  }
}