// src/hooks/useCloudinaryUpload.js
// Uploads an image file directly from the browser to Cloudinary.
// Spring Boot never touches the file — it only receives the URL string.
//
// SETUP (one-time):
// 1. Go to https://cloudinary.com — sign up free
// 2. Dashboard → Settings → Upload → Upload presets → Add upload preset
//    • Set signing mode to "Unsigned"
//    • Give it a name like "smart_inventory_products"
//    • Under "Folder", type "products"
//    • Save
// 3. Copy your Cloud Name from the dashboard top-left
// 4. Replace CLOUD_NAME and UPLOAD_PRESET below with your actual values

const CLOUD_NAME = 'jrukvi77'        // e.g. 'dxyz123abc'
const UPLOAD_PRESET = 'smart_inventory_products'  // the unsigned preset name

export function useCloudinaryUpload() {
    const upload = async (file) => {
        // Validate file type and size before sending
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowed.includes(file.type)) {
            throw new Error('Only JPG, PNG, WebP, or GIF images are allowed')
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image must be smaller than 5 MB')
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', UPLOAD_PRESET)
        // Tell Cloudinary to store in /products/ folder
        formData.append('folder', 'products')

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        )

        if (!response.ok) {
            throw new Error('Upload failed — check your Cloud Name and Upload Preset')
        }

        const data = await response.json()

        // Return the secure HTTPS URL
        // Cloudinary also gives you transformation URLs — e.g.:
        // data.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto/')
        // gives you a 400×400 cropped, auto-quality version — no extra work needed
        return data.secure_url
    }

    return { upload }
}