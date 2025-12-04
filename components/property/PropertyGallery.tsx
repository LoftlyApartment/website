'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ImageIcon } from '@/components/ui/Icons';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// Shimmer effect for loading placeholders
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="${w}" height="${h}" fill="#e2e8f0"/>
  <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"/>
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e2e8f0" offset="20%" />
      <stop stop-color="#f8fafc" offset="50%" />
      <stop stop-color="#e2e8f0" offset="70%" />
    </linearGradient>
  </defs>
</svg>`

const toBase64 = (str: string) => typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str)

interface PropertyGalleryProps {
  images: string[];
  propertyName: string;
}

// Room categories for organizing photos (matching Airbnb style)
const roomCategories = [
  { id: 'bedroom1', labelKey: 'bedroom1', prefix: 'bedroom1' },
  { id: 'bedroom2', labelKey: 'bedroom2', prefix: 'bedroom2' },
  { id: 'livingroom', labelKey: 'livingroom', prefix: 'livingroom' },
  { id: 'kitchen', labelKey: 'kitchenette', prefix: 'kitchen' },
  { id: 'bathroom', labelKey: 'bathroom', prefix: 'bathroom' },
  { id: 'terrace', labelKey: 'terrace', prefix: 'terrace' },
  { id: 'exterior', labelKey: 'exterior', prefix: 'exterior' },
];

// Helper function to extract category from image filename
const getCategoryFromImage = (imagePath: string): string | null => {
  const filename = imagePath.split('/').pop()?.toLowerCase() || '';
  for (const category of roomCategories) {
    if (filename.startsWith(category.prefix)) {
      return category.id;
    }
  }
  return null;
};

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, propertyName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('bedroom1');
  const galleryRef = useRef<HTMLDivElement>(null);
  // const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const t = useTranslations('property.gallery');

  const openGallery = (index: number = 0) => {
    setSelectedImage(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
    document.body.style.overflow = '';
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Scroll to image when clicking category
  // TODO: Implement scroll to specific image functionality
  // const scrollToImage = (_index: number) => {
  //   if (imageRefs.current[index]) {
  //     imageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   }
  // };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        }
      } else if (isGalleryOpen) {
        if (e.key === 'Escape') {
          closeGallery();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, isLightboxOpen]);

  // Group images by category based on filename prefix
  const imagesByCategory = useMemo(() => {
    const grouped: Record<string, { image: string; globalIndex: number }[]> = {};

    // Initialize all categories
    roomCategories.forEach(cat => {
      grouped[cat.id] = [];
    });

    // Group images by their filename prefix
    images.forEach((image, index) => {
      const category = getCategoryFromImage(image);
      if (category && grouped[category]) {
        grouped[category].push({ image, globalIndex: index });
      }
    });

    return grouped;
  }, [images]);

  // Get images for a specific category
  const getImagesForCategory = (categoryId: string) => {
    return imagesByCategory[categoryId] || [];
  };

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div
          className="relative h-[500px] md:h-[600px] lg:h-[700px] rounded-xl overflow-hidden cursor-pointer group bg-luxury-cream-100"
          onClick={() => openGallery(0)}
        >
          <Image
            src={images[selectedImage]}
            alt={`${propertyName} - ${selectedImage + 1}`}
            fill
            quality={85}
            sizes="100vw"
            priority
            placeholder="blur"
            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center gap-2">
            <ImageIcon size={20} />
            <span className="font-medium">{images.length} {t('photos')}</span>
          </div>
        </div>
      </div>

      {/* Airbnb-style Scrollable Photo Tour Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
            <div className="flex items-center gap-4 px-4 py-3">
              {/* Back button */}
              <button
                onClick={closeGallery}
                className="flex-shrink-0 text-neutral-900 hover:bg-neutral-100 p-2 rounded-full transition-colors"
                aria-label={t('close')}
              >
                <ChevronLeftIcon size={24} />
              </button>

              {/* Photo Tour Title */}
              <h2 className="flex-shrink-0 text-lg font-semibold">{t('photoTour')}</h2>

              {/* Category Navigation - Scrollable */}
              <div className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 items-center">
                  {roomCategories.map((category) => {
                    const categoryImages = getImagesForCategory(category.id);
                    if (categoryImages.length === 0) return null;

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          // Scroll to the category section
                          const element = document.getElementById(`category-${category.id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="flex-shrink-0 text-center group"
                      >
                        <div className={`relative w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                          activeCategory === category.id
                            ? 'border-neutral-900'
                            : 'border-transparent hover:border-neutral-300'
                        }`}>
                          <Image
                            src={categoryImages[0].image}
                            alt={t(category.labelKey)}
                            width={80}
                            height={60}
                            quality={60}
                            placeholder="blur"
                            blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(80, 60))}`}
                            className="object-cover"
                          />
                        </div>
                        <span className={`text-[10px] md:text-xs block mt-1 ${
                          activeCategory === category.id
                            ? 'font-semibold text-neutral-900'
                            : 'text-neutral-600'
                        }`}>
                          {t(category.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Scrollable Image Content */}
          <div
            ref={galleryRef}
            className="overflow-y-auto"
            style={{ height: 'calc(100vh - 100px)' }}
          >
            <div className="max-w-6xl mx-auto px-6 py-8">
              {roomCategories.map((category) => {
                const categoryImages = getImagesForCategory(category.id);
                if (categoryImages.length === 0) return null;

                // Group images: first one large, then pairs of 2
                const firstImage = categoryImages[0];
                const remainingImages = categoryImages.slice(1);
                const imagePairs: { image: string; globalIndex: number }[][] = [];
                for (let i = 0; i < remainingImages.length; i += 2) {
                  imagePairs.push(remainingImages.slice(i, i + 2));
                }

                return (
                  <div key={category.id} id={`category-${category.id}`} className="mb-16">
                    {/* Category Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                      {/* Category Title & Description - Left Side */}
                      <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-8">
                          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                            {t(category.labelKey)}
                          </h3>
                        </div>
                      </div>

                      {/* Images - Right Side */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* First image - Large */}
                        {firstImage && (
                          <div
                            className="relative rounded-xl overflow-hidden bg-neutral-100 cursor-pointer hover:opacity-95 transition-opacity aspect-[4/3]"
                            onClick={() => openLightbox(firstImage.globalIndex)}
                          >
                            <Image
                              src={firstImage.image}
                              alt={`${propertyName} - ${t(category.labelKey)} 1`}
                              fill
                              quality={85}
                              sizes="(max-width: 768px) 100vw, 66vw"
                              placeholder="blur"
                              blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Remaining images - 2 per row */}
                        {imagePairs.map((pair, pairIndex) => (
                          <div key={pairIndex} className="grid grid-cols-2 gap-4">
                            {pair.map((item) => (
                              <div
                                key={item.globalIndex}
                                className="relative rounded-xl overflow-hidden bg-neutral-100 cursor-pointer hover:opacity-95 transition-opacity aspect-[4/3]"
                                onClick={() => openLightbox(item.globalIndex)}
                              >
                                <Image
                                  src={item.image}
                                  alt={`${propertyName} - ${t(category.labelKey)}`}
                                  fill
                                  quality={75}
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                  placeholder="blur"
                                  blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                                  className="object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Close button - Fixed position */}
          <button
            onClick={closeGallery}
            className="fixed top-4 right-4 z-20 p-2 bg-white hover:bg-neutral-100 rounded-full shadow-md transition-colors"
            aria-label={t('close')}
          >
            <XIcon size={24} className="text-neutral-900" />
          </button>
        </div>
      )}

      {/* Full-screen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          onClick={closeLightbox}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/80">
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="flex items-center gap-2 text-white hover:text-neutral-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <XIcon size={20} />
              <span className="text-sm font-medium">{t('close')}</span>
            </button>

            {/* Image Counter */}
            <div className="text-white font-medium">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Spacer for alignment */}
            <div className="w-24"></div>
          </div>

          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center relative px-16">
            {/* Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
              aria-label={t('previous')}
            >
              <ChevronLeftIcon size={28} className="text-white" />
            </button>

            {/* Image */}
            <div
              className="relative max-w-5xl max-h-[80vh] w-full h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[lightboxIndex]}
                alt={`${propertyName} - ${lightboxIndex + 1}`}
                fill
                quality={90}
                sizes="100vw"
                priority
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                className="object-contain rounded-lg"
              />
            </div>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all"
              aria-label={t('next')}
            >
              <ChevronRightIcon size={28} className="text-white" />
            </button>
          </div>

          {/* Footer with description (optional) */}
          <div className="px-4 py-4 bg-black/80 text-center">
            <p className="text-white/80 text-sm max-w-2xl mx-auto">
              {propertyName}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
