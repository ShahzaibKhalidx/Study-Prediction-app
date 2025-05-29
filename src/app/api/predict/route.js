export async function POST(request) {
  try {
    const body = await request.json();
    const { study_hours, private_tuition, internet_access, sleep_hours, sports_participation } = body;

    // Validate input
    if (
      typeof study_hours !== 'number' ||
      typeof sleep_hours !== 'number' ||
      typeof private_tuition !== 'boolean' ||
      typeof internet_access !== 'boolean' ||
      typeof sports_participation !== 'boolean'
    ) {
      return new Response(JSON.stringify({ error: 'Invalid input data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Linear regression model coefficients and intercept
    const coefficients = [0.11198438, 0.0, 0.0, 0.05257882, 0.0];
    const intercept = 0.15002077015743787;

    // Input vector
    const input = [
      study_hours,
      private_tuition ? 1 : 0,
      internet_access ? 1 : 0,
      sleep_hours,
      sports_participation ? 1 : 0,
    ];

    // Compute dot product
    const prediction = input.reduce((sum, value, index) => sum + value * coefficients[index], 0) + intercept;

    // Convert to percentage and clamp between 0 and 100
    const predictedScore = Math.min(Math.max((prediction * 100).toFixed(2), 0), 100);

    return new Response(JSON.stringify({ predictedScore }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Prediction failed: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}