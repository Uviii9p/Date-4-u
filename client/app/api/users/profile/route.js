import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (user) {
            return NextResponse.json(user.toObject());
        } else {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Profile GET Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        console.log('[Profile PUT] Starting update...');
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            console.log('[Profile PUT] Unauthorized');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const contentType = req.headers.get('content-type') || '';
        let updates = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            console.log('[Profile PUT] Received Form Data');

            if (formData.has('name')) updates.name = formData.get('name');
            if (formData.has('bio')) updates.bio = formData.get('bio');
            if (formData.has('age')) updates.age = Number(formData.get('age'));
            if (formData.has('gender')) updates.gender = formData.get('gender');
            if (formData.has('genderPreference')) updates.genderPreference = formData.get('genderPreference');

            // Handle Image Uploads (Convert to Base64 for Vercel support without storage)
            const imageFiles = formData.getAll('images');
            if (imageFiles && imageFiles.length > 0) {
                const processedImages = await Promise.all(imageFiles.map(async (item) => {
                    if (typeof item === 'string') return item; // Existing URL/Base64

                    // It's a File object
                    const bytes = await item.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const type = item.type || 'image/jpeg';
                    return `data:${type};base64,${buffer.toString('base64')}`;
                }));
                updates.images = processedImages;
            }

            const interestsStr = formData.get('interests');
            if (interestsStr) {
                try {
                    updates.interests = JSON.parse(interestsStr);
                } catch {
                    updates.interests = interestsStr.split(',').map(i => i.trim()).filter(Boolean);
                }
            }
        } else {
            const body = await req.json();
            updates = body;
        }

        // Clean updates object
        Object.keys(updates).forEach(key => {
            if (updates[key] === undefined || updates[key] === null) delete updates[key];
        });

        console.log('[Profile PUT] Updating user:', decoded.id, 'with:', Object.keys(updates));

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (user) {
            console.log('[Profile PUT] Update successful');
            return NextResponse.json(user.toObject());
        } else {
            console.log('[Profile PUT] User not found');
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('[Profile PUT] Error:', error);
        return NextResponse.json({
            message: error.message || 'Update failed',
            details: error.name === 'ValidationError' ? Object.values(error.errors).map(e => e.message) : undefined
        }, { status: 500 });
    }
}
