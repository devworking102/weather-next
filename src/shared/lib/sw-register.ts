/** Đổi giá trị này + `SW_CACHE_VERSION` trong `public/sw.js` khi đổi policy cache (đang v6). */
export const SW_SCRIPT_QUERY = process.env.NEXT_PUBLIC_SW_CACHE_VERSION ?? '6'
