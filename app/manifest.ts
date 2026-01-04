import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'UBES Student Portal',
        short_name: 'UBES Portal',
        description: 'The official portal for the UBES Student Engineering Council.',
        start_url: '/dashboard/student',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
