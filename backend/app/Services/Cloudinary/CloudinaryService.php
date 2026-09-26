<?php

namespace App\Services\Cloudinary;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class CloudinaryService
{
    /**
     * Generic upload method
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param array $transformation
     * @return array|null Returns ['url' => ..., 'public_id' => ...] or null on failure
     */
    public function uploadImage(UploadedFile $file, string $folder, array $transformation = [])
    {
        try {
            $options = ['folder' => $folder];
            if (!empty($transformation)) {
                $options['transformation'] = $transformation;
            }

            $uploaded = Cloudinary::uploadApi()->upload($file->getRealPath(), $options);

            return [
                'url' => $uploaded['secure_url'],
                'public_id' => $uploaded['public_id'],
            ];
        } catch (\Exception $e) {
            Log::error("Cloudinary upload failed for {$folder}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Upload an avatar to Cloudinary
     */
    public function uploadAvatar(UploadedFile $file, string $actorType)
    {
        $folder = "cafeflow/avatars/{$actorType}";
        return $this->uploadImage($file, $folder, [
            'width' => 512,
            'height' => 512,
            'crop' => 'fill',
            'gravity' => 'face',
            'quality' => 'auto',
            'fetch_format' => 'auto'
        ]);
    }

    /**
     * Upload a category image
     */
    public function uploadCategory(UploadedFile $file)
    {
        return $this->uploadImage($file, "cafeflow/categories", [
            'width' => 800,
            'height' => 500,
            'crop' => 'fill',
            'quality' => 'auto',
            'fetch_format' => 'auto'
        ]);
    }

    /**
     * Upload a product image
     */
    public function uploadProduct(UploadedFile $file)
    {
        return $this->uploadImage($file, "cafeflow/products", [
            'width' => 800,
            'height' => 800,
            'crop' => 'fill',
            'quality' => 'auto',
            'fetch_format' => 'auto'
        ]);
    }

    /**
     * Delete an image from Cloudinary by public ID
     */
    public function delete(string $publicId)
    {
        if (empty($publicId)) {
            return false;
        }

        try {
            Cloudinary::uploadApi()->destroy($publicId, ['invalidate' => true]);
            return true;
        } catch (\Exception $e) {
            Log::error("Cloudinary delete failed for {$publicId}: " . $e->getMessage());
            return false;
        }
    }
}

