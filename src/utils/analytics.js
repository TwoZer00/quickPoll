export const track = (event, data) => import.meta.env.PROD && window.umami?.track(event, data)
