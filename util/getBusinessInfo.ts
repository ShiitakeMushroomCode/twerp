export async function fetchBusinessInfo({ businesses }) {
  try {
    const response = await fetch(
      `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${process.env.BUSINESS_INFO_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(businesses),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    const validValue = jsonResponse.data[0].valid;
    if (validValue == '01') {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
