export async function register() {
    // this is a manual instrumentation for frontend(https://nextjs.org/docs/app/building-your-application/optimizing/open-telemetry)
    // this only works for node runtime
    // for deployment on vercel, use @vercel/opentelemetry instead
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        await import('./instrumentation.node')
    }
}