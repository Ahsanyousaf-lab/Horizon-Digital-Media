import React, { useState, useEffect, useRef } from 'react';
import { PageId, PortfolioCard } from '../types';
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ITEMS,
  SERVICE_CATEGORY_REVIEWS,
} from '../data/websiteData';
import { compressImageFile, idbGet, idbSet } from '../utils/imageUtils';
import {
  subscribeProjects,
  saveProjectToFirestore,
  deleteProjectFromFirestore,
  FirestoreProject,
} from '../lib/firebase';

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
}

// Sub-services and templates for each primary category
const SERVICE_SUB_CATEGORIES: Record<string, string[]> = {
  'graphic-designing': [
    'Brand Identity Systems',
    'YouTube Thumbnail Design Kits',
    'Social Media Campaign Kits',
    'Pitch Deck & Presentation Design',
    'Digital Ad Creative Sets',
    'Custom Graphic Assets',
  ],
  'video-editing': [
    'Short-form Reels & TikTok Pipeline',
    'YouTube & Documentary Editing',
    'Podcast Post-Production',
    'Commercial & Brand Films',
    'Color, Sound & Finishing',
  ],
  'ugc-cgi': [
    'UGC Performance Ads',
    'Product CGI Concepts',
    'Social Ad Variations (Hooks & CTAs)',
    'Hook & Offer Creative',
    'E-commerce Product Spots',
  ],
  'ai-video': [
    'AI-Assisted Video Cuts',
    'AI FX & Motion Experiments',
    'Generative B-roll Concepts',
    'AI Voice & Visual Cleanup',
    'AI Ad Iteration Systems',
  ],
  'prompt-engineering': [
    'Image Generation Prompt Systems',
    'Video Generation Prompt Systems',
    'UGC Character & Scene Prompts',
    'Brand-Consistent Prompt Libraries',
    'AI Workflow Documentation',
  ],
  'web-development': [
    'Custom Website Development',
    'AI Website Development',
    'Shopify Store Development',
    'Website Design & Development',
    'AI-Powered Business Website',
  ],
};

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<PortfolioCard | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isFullscreenDetailsOpen, setIsFullscreenDetailsOpen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // Persistent storage states
  const [customCardGalleries, setCustomCardGalleries] = useState<Record<string, string[]>>({});
  const [userProjects, setUserProjects] = useState<PortfolioCard[]>([]);
  const [firestoreProjects, setFirestoreProjects] = useState<FirestoreProject[]>([]);
  const [editedProjects, setEditedProjects] = useState<Record<string, Partial<PortfolioCard>>>({});
  const [deletedProjectIds, setDeletedProjectIds] = useState<string[]>([]);

  // Add Project modal states
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [targetSubCategory, setTargetSubCategory] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('graphic-designing');
  const [newSubCategory, setNewSubCategory] = useState('Brand Identity Systems');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newTools, setNewTools] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Edit Project modal states (works for ANY project: demo or custom)
  const [projectToEdit, setProjectToEdit] = useState<PortfolioCard | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState('graphic-designing');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTools, setEditTools] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);

  // Delete confirmation modal state
  const [projectToDelete, setProjectToDelete] = useState<PortfolioCard | null>(null);

  // Copied prompt state for Prompt Engineering modal
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Reviews manual scroll and drag states
  const reviewsTrackRef = useRef<HTMLDivElement>(null);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  // Load custom projects, galleries, edits, and deletions from IndexedDB with localStorage fallback
  useEffect(() => {
    async function loadData() {
      try {
        // Galleries
        const idbGalleries = await idbGet<Record<string, string[]>>('horizon_card_galleries');
        if (idbGalleries) {
          setCustomCardGalleries(idbGalleries);
        } else {
          const stored = localStorage.getItem('horizon_card_images');
          if (stored) {
            const parsed = JSON.parse(stored);
            const converted: Record<string, string[]> = {};
            Object.entries(parsed).forEach(([k, v]) => {
              converted[k] = Array.isArray(v) ? (v as string[]) : [v as string];
            });
            setCustomCardGalleries(converted);
          }
        }

        // User projects
        const idbProjects = await idbGet<PortfolioCard[]>('horizon_user_projects');
        if (idbProjects) {
          setUserProjects(idbProjects);
        } else {
          const storedProjects = localStorage.getItem('horizon_user_projects');
          if (storedProjects) setUserProjects(JSON.parse(storedProjects));
        }

        // Edited project overrides (for demo or custom projects)
        const idbEdits = await idbGet<Record<string, Partial<PortfolioCard>>>('horizon_edited_projects');
        if (idbEdits) {
          setEditedProjects(idbEdits);
        } else {
          const storedEdits = localStorage.getItem('horizon_edited_projects');
          if (storedEdits) setEditedProjects(JSON.parse(storedEdits));
        }

        // Deleted project IDs (for demo or custom projects)
        const idbDeleted = await idbGet<string[]>('horizon_deleted_project_ids');
        if (idbDeleted) {
          setDeletedProjectIds(idbDeleted);
        } else {
          const storedDeleted = localStorage.getItem('horizon_deleted_project_ids');
          if (storedDeleted) setDeletedProjectIds(JSON.parse(storedDeleted));
        }
      } catch (e) {
        console.warn('Storage load error:', e);
      }
    }
    loadData();

    const handleProjectsUpdated = () => {
      loadData();
    };
    window.addEventListener('horizon_projects_updated', handleProjectsUpdated);
    window.addEventListener('storage', handleProjectsUpdated);
    return () => {
      window.removeEventListener('horizon_projects_updated', handleProjectsUpdated);
      window.removeEventListener('storage', handleProjectsUpdated);
    };
  }, []);

  // Real-time Firestore synchronization for portfolio projects
  useEffect(() => {
    const unsubscribe = subscribeProjects((fsList) => {
      setFirestoreProjects(fsList);
    });
    return () => unsubscribe();
  }, []);

  // Sync subcategory options when category changes in add modal
  useEffect(() => {
    const subs = SERVICE_SUB_CATEGORIES[newCategory] || [];
    if (subs.length > 0 && (!newSubCategory || !subs.includes(newSubCategory))) {
      setNewSubCategory(subs[0]);
    }
  }, [newCategory, newSubCategory]);

  // Sync subcategory options when category changes in edit modal
  useEffect(() => {
    const subs = SERVICE_SUB_CATEGORIES[editCategory] || [];
    if (subs.length > 0 && (!editSubCategory || !subs.includes(editSubCategory))) {
      setEditSubCategory(subs[0]);
    }
  }, [editCategory, editSubCategory]);

  // Lock body scroll when Fullscreen Project View is active
  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCard]);

  // Handle keyboard navigation for Fullscreen lightbox
  useEffect(() => {
    if (!selectedCard) return;
    const currentImages = getCardImages(selectedCard);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (projectToEdit) {
          setProjectToEdit(null);
        } else if (projectToDelete) {
          setProjectToDelete(null);
        } else {
          handleCloseFullscreen();
        }
      } else if (e.key === 'ArrowRight' && currentImages.length > 1) {
        setSelectedImageIndex((prev) => (prev + 1) % currentImages.length);
      } else if (e.key === 'ArrowLeft' && currentImages.length > 1) {
        setSelectedImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCard, customCardGalleries, projectToEdit, projectToDelete]);

  // Listen for fullscreenchange
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Helper to get all images for a card (from user overrides, card images array, or single image)
  const getCardImages = (card: PortfolioCard): string[] => {
    const overrides = customCardGalleries[card.id];
    if (overrides && overrides.length > 0) return overrides;
    if (card.images && card.images.length > 0) return card.images;
    if (card.customImage) return [card.customImage];
    return [];
  };

  // Open Fullscreen Project View
  const handleOpenCard = (card: PortfolioCard) => {
    setSelectedCard(card);
    setSelectedImageIndex(0);
    setIsFullscreenDetailsOpen(false);
  };

  // Close Fullscreen Project View
  const handleCloseFullscreen = () => {
    setSelectedCard(null);
    setSelectedImageIndex(0);
    setIsFullscreenDetailsOpen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Toggle browser native fullscreen mode
  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Open Edit Modal for ANY project (demo or custom)
  const handleStartEditProject = (card: PortfolioCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToEdit(card);
    setEditTitle(card.title);
    setEditSubtitle(card.subtitle);
    setEditCategory(card.category);
    setEditSubCategory(card.subCategory || (SERVICE_SUB_CATEGORIES[card.category]?.[0] || ''));
    setEditDescription(card.description);
    setEditTools(card.tools.join(', '));
    setEditTags(card.tags.join(', '));
    setEditImages([...getCardImages(card)]);
  };

  // Open Delete Confirmation for ANY project (demo or custom)
  const handleStartDeleteProject = (card: PortfolioCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjectToDelete(card);
  };

  // Confirm deletion of project
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    const targetId = projectToDelete.id;

    // Add to deletedProjectIds
    const updatedDeleted = Array.from(new Set([...deletedProjectIds, targetId]));
    setDeletedProjectIds(updatedDeleted);
    await idbSet('horizon_deleted_project_ids', updatedDeleted);
    try {
      localStorage.setItem('horizon_deleted_project_ids', JSON.stringify(updatedDeleted));
    } catch {}

    // If user project, also remove from userProjects
    if (userProjects.some((p) => p.id === targetId)) {
      const updatedUser = userProjects.filter((p) => p.id !== targetId);
      setUserProjects(updatedUser);
      await idbSet('horizon_user_projects', updatedUser);
      try {
        localStorage.setItem('horizon_user_projects', JSON.stringify(updatedUser));
      } catch {}
    }

    // Also delete from Firestore database
    deleteProjectFromFirestore(targetId).catch((err) =>
      console.warn('Firestore project delete notice:', err)
    );

    // Close fullscreen if this card was open
    if (selectedCard?.id === targetId) {
      handleCloseFullscreen();
    }

    setProjectToDelete(null);
  };

  // Restore deleted default demo projects
  const handleRestoreDeleted = async () => {
    setDeletedProjectIds([]);
    await idbSet('horizon_deleted_project_ids', []);
    try {
      localStorage.removeItem('horizon_deleted_project_ids');
    } catch {}
  };

  // Quick open Add Project modal targeting a specific sub-category or box
  const handleOpenAddForBox = (category: string, subCat: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNewCategory(category);
    setNewSubCategory(subCat);
    setTargetSubCategory(subCat);
    setNewTitle(`${subCat} Deliverable`);
    setNewSubtitle('Bespoke Client Asset Bundle');
    setNewDescription(`Tailored ${subCat.toLowerCase()} project engineered for maximum visual conversion and high brand impact.`);
    setNewTags('Portfolio, Client Work, High CTR');
    setNewTools(category === 'graphic-designing' ? 'Photoshop, Illustrator, Figma' : 'Premiere Pro, After Effects');
    setNewImages([]);
    setIsAddingProject(true);
  };

  // Batch upload multiple files for Add modal
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsCompressing(true);
    const files = Array.from(e.target.files);
    try {
      const compressedList: string[] = [];
      for (const file of files) {
        const compressed = await compressImageFile(file, 1600, 1600, 0.85);
        if (compressed) compressedList.push(compressed);
      }
      setNewImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.warn('Error compressing files:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Batch upload multiple files for Edit modal
  const handleEditFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsCompressing(true);
    const files = Array.from(e.target.files);
    try {
      const compressedList: string[] = [];
      for (const file of files) {
        const compressed = await compressImageFile(file, 1600, 1600, 0.85);
        if (compressed) compressedList.push(compressed);
      }
      setEditImages((prev) => [...prev, ...compressedList]);
    } catch (err) {
      console.warn('Error compressing edit files:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Add more photos directly from Fullscreen topbar
  const handleAddPhotosFromFullscreen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCard || !e.target.files || e.target.files.length === 0) return;
    setIsCompressing(true);
    const files = Array.from(e.target.files);
    try {
      const compressedList: string[] = [];
      for (const file of files) {
        const compressed = await compressImageFile(file, 1600, 1600, 0.85);
        if (compressed) compressedList.push(compressed);
      }
      const existing = getCardImages(selectedCard);
      const combined = [...existing, ...compressedList];

      // Update galleries
      const updatedGalleries = { ...customCardGalleries, [selectedCard.id]: combined };
      setCustomCardGalleries(updatedGalleries);
      await idbSet('horizon_card_galleries', updatedGalleries);
      try {
        localStorage.setItem('horizon_card_images', JSON.stringify(updatedGalleries));
      } catch {}

      // Update user project if custom
      if (selectedCard.isUserAdded) {
        const updatedUserProjects = userProjects.map((p) =>
          p.id === selectedCard.id
            ? { ...p, images: combined, customImage: combined[0] }
            : p
        );
        setUserProjects(updatedUserProjects);
        await idbSet('horizon_user_projects', updatedUserProjects);
      }

      // Update selectedCard
      setSelectedCard({
        ...selectedCard,
        images: combined,
        customImage: combined[0],
      });
      setSelectedImageIndex(combined.length - 1);
    } catch (err) {
      console.warn('Error adding photos to card:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  // Remove uploaded image by index before submitting in Add modal
  const handleRemoveNewImage = (idx: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Remove image by index in Edit modal (can remove demo photos!)
  const handleRemoveEditImage = (idx: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit new project
  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const catObj = PORTFOLIO_CATEGORIES.find((c) => c.id === newCategory) || {
      id: newCategory,
      label: 'Service',
    };

    const newProject: PortfolioCard = {
      id: 'custom-' + Date.now(),
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || newSubCategory || 'Custom Client Asset',
      category: newCategory,
      categoryLabel: catObj.label,
      subCategory: newSubCategory,
      description: newDescription.trim() || 'Bespoke client production deliverable.',
      tags: newTags
        ? newTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Custom', 'Portfolio'],
      tools: newTools
        ? newTools.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Horizon Studio Suite'],
      previewType: newCategory === 'graphic-designing' ? 'design' : newCategory === 'web-development' ? 'code' : 'video',
      customImage: newImages[0] || undefined,
      images: newImages.length > 0 ? newImages : undefined,
      isUserAdded: true,
      createdAt: Date.now(),
      badge: 'Client Work',
    };

    // Prepend to top so it appears as the topmost recent project!
    const updated = [newProject, ...userProjects];
    setUserProjects(updated);
    await idbSet('horizon_user_projects', updated);
    try {
      localStorage.setItem('horizon_user_projects', JSON.stringify(updated));
    } catch {}

    // Save to Firestore database for real-time sync across devices & Admin Panel
    saveProjectToFirestore({
      id: newProject.id,
      title: newProject.title,
      category: newProject.category,
      subCategory: newProject.subCategory,
      subtitle: newProject.subtitle,
      description: newProject.description,
      tags: newProject.tags,
      tools: newProject.tools,
      heroImage: newProject.customImage,
      images: newProject.images || (newProject.customImage ? [newProject.customImage] : []),
      createdAt: new Date().toISOString(),
      isCustom: true,
    }).catch((err) => console.warn('Firestore project save notice:', err));

    // Reset form
    setNewTitle('');
    setNewSubtitle('');
    setNewDescription('');
    setNewTags('');
    setNewTools('');
    setNewImages([]);
    setIsAddingProject(false);
  };

  // Save changes from Edit Modal (works for ANY project: demo or custom)
  const handleSaveProjectEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectToEdit) return;

    const catObj = PORTFOLIO_CATEGORIES.find((c) => c.id === editCategory) || {
      id: editCategory,
      label: 'Service',
    };

    const updatedCard: PortfolioCard = {
      ...projectToEdit,
      title: editTitle.trim() || projectToEdit.title,
      subtitle: editSubtitle.trim() || projectToEdit.subtitle,
      category: editCategory,
      categoryLabel: catObj.label,
      subCategory: editSubCategory || projectToEdit.subCategory,
      description: editDescription.trim() || projectToEdit.description,
      tools: editTools
        ? editTools.split(',').map((t) => t.trim()).filter(Boolean)
        : projectToEdit.tools,
      tags: editTags
        ? editTags.split(',').map((t) => t.trim()).filter(Boolean)
        : projectToEdit.tags,
      customImage: editImages[0] || undefined,
      images: editImages.length > 0 ? editImages : undefined,
    };

    // 1. Update galleries storage
    const updatedGalleries = {
      ...customCardGalleries,
      [projectToEdit.id]: editImages,
    };
    setCustomCardGalleries(updatedGalleries);
    await idbSet('horizon_card_galleries', updatedGalleries);
    try {
      localStorage.setItem('horizon_card_images', JSON.stringify(updatedGalleries));
    } catch {}

    // 2. Save edits in editedProjects
    const updatedEdits = {
      ...editedProjects,
      [projectToEdit.id]: {
        title: updatedCard.title,
        subtitle: updatedCard.subtitle,
        category: updatedCard.category,
        categoryLabel: updatedCard.categoryLabel,
        subCategory: updatedCard.subCategory,
        description: updatedCard.description,
        tools: updatedCard.tools,
        tags: updatedCard.tags,
        customImage: updatedCard.customImage,
        images: updatedCard.images,
      },
    };
    setEditedProjects(updatedEdits);
    await idbSet('horizon_edited_projects', updatedEdits);
    try {
      localStorage.setItem('horizon_edited_projects', JSON.stringify(updatedEdits));
    } catch {}

    // 3. If user-added, update userProjects
    if (projectToEdit.isUserAdded) {
      const updatedUserProjects = userProjects.map((p) =>
        p.id === projectToEdit.id ? updatedCard : p
      );
      setUserProjects(updatedUserProjects);
      await idbSet('horizon_user_projects', updatedUserProjects);
      try {
        localStorage.setItem('horizon_user_projects', JSON.stringify(updatedUserProjects));
      } catch {}
    }

    // 4. Update in Firestore
    saveProjectToFirestore({
      id: updatedCard.id,
      title: updatedCard.title,
      category: updatedCard.category,
      subCategory: updatedCard.subCategory,
      subtitle: updatedCard.subtitle,
      description: updatedCard.description,
      tags: updatedCard.tags,
      tools: updatedCard.tools,
      heroImage: updatedCard.customImage,
      images: updatedCard.images || (updatedCard.customImage ? [updatedCard.customImage] : []),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
    }).catch((err) => console.warn('Firestore project update notice:', err));

    // 5. Update selectedCard if currently open
    if (selectedCard?.id === projectToEdit.id) {
      setSelectedCard(updatedCard);
      setSelectedImageIndex(0);
    }

    setProjectToEdit(null);
  };

  // Combine items: Apply overrides, filter deleted, put user-added at very TOP
  const defaultItems = PORTFOLIO_ITEMS
    .filter((item) => !deletedProjectIds.includes(item.id))
    .map((item) => {
      const edits = editedProjects[item.id] || {};
      const customImgs = customCardGalleries[item.id];
      return {
        ...item,
        ...edits,
        images: customImgs !== undefined ? customImgs : edits.images || item.images,
        customImage:
          (customImgs && customImgs[0]) ||
          edits.customImage ||
          item.customImage,
      };
    });

  const activeUserProjects = userProjects
    .filter((item) => !deletedProjectIds.includes(item.id))
    .map((item) => {
      const edits = editedProjects[item.id] || {};
      const customImgs = customCardGalleries[item.id];
      return {
        ...item,
        ...edits,
        images: customImgs !== undefined ? customImgs : edits.images || item.images,
        customImage:
          (customImgs && customImgs[0]) ||
          edits.customImage ||
          item.customImage,
      };
    });

  // Map live Firestore projects
  const firestoreCards: PortfolioCard[] = firestoreProjects
    .filter((fp) => !deletedProjectIds.includes(fp.id))
    .map((fp) => {
      const catObj = PORTFOLIO_CATEGORIES.find((c) => c.id === fp.category) || {
        id: fp.category,
        label: fp.category,
      };
      const edits = editedProjects[fp.id] || {};
      const customImgs = customCardGalleries[fp.id];
      const imgs =
        customImgs !== undefined
          ? customImgs
          : fp.images && fp.images.length > 0
          ? fp.images
          : fp.heroImage
          ? [fp.heroImage]
          : [];
      return {
        id: fp.id,
        title: fp.title,
        subtitle: fp.subtitle || '',
        category: fp.category,
        categoryLabel: catObj.label,
        subCategory: fp.subCategory || 'Brand Identity Systems',
        description: fp.description || '',
        tools: fp.tools && fp.tools.length > 0 ? fp.tools : ['Photoshop', 'Illustrator'],
        tags: fp.tags && fp.tags.length > 0 ? fp.tags : ['Custom', 'Portfolio'],
        previewType:
          fp.category === 'graphic-designing'
            ? 'design'
            : fp.category === 'web-development'
            ? 'code'
            : 'video',
        images: imgs,
        customImage: imgs[0] || fp.heroImage,
        videoUrl: fp.videoUrl,
        videos: fp.videos,
        isUserAdded: true,
        createdAt: new Date(fp.createdAt || Date.now()).getTime(),
        badge: 'Client Work',
        ...edits,
      };
    });

  // Combine user projects and firestore projects (deduplicating by ID)
  const combinedUserProjects: PortfolioCard[] = [...firestoreCards];
  activeUserProjects.forEach((up) => {
    if (!combinedUserProjects.some((p) => p.id === up.id)) {
      combinedUserProjects.push(up);
    }
  });

  // Recent user items first, then catalog items
  const allItems = [...combinedUserProjects, ...defaultItems];

  // Filter items by category or 'recent'
  const filteredItems =
    activeCategory === 'all'
      ? allItems
      : activeCategory === 'recent'
      ? combinedUserProjects.length > 0
        ? combinedUserProjects
        : allItems.slice(0, 6)
      : allItems.filter((item) => item.category === activeCategory);

  // Reviews for the current service category (or all combined if 'all')
  const getCategoryReviews = () => {
    if (activeCategory === 'all' || activeCategory === 'recent') {
      return [
        ...(SERVICE_CATEGORY_REVIEWS['video-editing'] || []).slice(0, 2),
        ...(SERVICE_CATEGORY_REVIEWS['graphic-designing'] || []).slice(0, 2),
        ...(SERVICE_CATEGORY_REVIEWS['ugc-cgi'] || []).slice(0, 2),
      ];
    }
    return (
      SERVICE_CATEGORY_REVIEWS[activeCategory] ||
      SERVICE_CATEGORY_REVIEWS['graphic-designing'] ||
      []
    );
  };

  const currentReviews = getCategoryReviews();
  const currentCategoryLabel =
    PORTFOLIO_CATEGORIES.find((c) => c.id === activeCategory)?.label ||
    (activeCategory === 'recent' ? 'Recent Projects' : 'Selected Service');
  const totalReviews = currentReviews.length;

  const handleReviewsScroll = () => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const newIdx = Math.round(el.scrollLeft / cardWidth);
    setActiveReviewIndex(Math.min(totalReviews - 1, Math.max(0, newIdx)));
  };

  const scrollToIndex = (idx: number) => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    const cards = el.children;
    const targetCard = cards[idx] as HTMLElement;
    if (targetCard) {
      el.scrollTo({ left: targetCard.offsetLeft - el.offsetLeft, behavior: 'smooth' });
      setActiveReviewIndex(idx);
    }
  };

  const handlePrevReview = () => {
    const newIdx = activeReviewIndex > 0 ? activeReviewIndex - 1 : totalReviews - 1;
    scrollToIndex(newIdx);
  };

  const handleNextReview = () => {
    const newIdx = activeReviewIndex < totalReviews - 1 ? activeReviewIndex + 1 : 0;
    scrollToIndex(newIdx);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = reviewsTrackRef.current;
    if (!el) return;
    setIsMouseDown(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const el = reviewsTrackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.3;
    el.scrollLeft = dragScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  return (
    <div className="w-full py-12 md:py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)] inline-block animate-fade-in-up">
                Services & Creative Showcase
              </span>
              {activeUserProjects.length > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ✨ {activeUserProjects.length} Custom Added
                </span>
              )}
            </div>
            <h1
              style={{ fontFamily: 'Georgia, serif' }}
              className="font-bold text-3xl sm:text-5xl md:text-6xl text-[var(--text)] tracking-tight"
            >
              High-Converting Work Across Every Digital Vertical
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] mt-4 leading-relaxed max-w-2xl">
              Browse our signature brand identities, video post-production pipelines, digital design kits, and creative showcases. Click any project to explore high-resolution assets in full-screen.
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar border-b border-[var(--line)]" role="tablist">
          {/* All Services */}
          <button
            role="tab"
            aria-selected={activeCategory === 'all'}
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] shadow-lg shadow-[var(--glow)] scale-105'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]'
            }`}
          >
            All Services ({allItems.length})
          </button>

          {/* Recent Projects Tab */}
          <button
            role="tab"
            aria-selected={activeCategory === 'recent'}
            onClick={() => setActiveCategory('recent')}
            className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'recent'
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] shadow-lg shadow-[var(--glow)] scale-105'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-2)] text-amber-400 hover:text-amber-300 border border-amber-400/30'
            }`}
          >
            <span>✨</span>
            <span>Recent Projects</span>
            {activeUserProjects.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-white font-mono">
                {activeUserProjects.length}
              </span>
            )}
          </button>

          {/* Category Tabs */}
          {PORTFOLIO_CATEGORIES.filter((c) => c.id !== 'all').map((cat, cIdx) => {
            const isActive = activeCategory === cat.id;
            const count = allItems.filter((i) => i.category === cat.id).length;
            return (
              <button
                key={`cat-tab-${cat.id || cIdx}-${cIdx}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] shadow-lg shadow-[var(--glow)] scale-105'
                    : 'bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredItems.map((item, itmIdx) => {
            const cardImages = getCardImages(item);
            const coverImg = cardImages[0] || item.customImage;
            const isUserItem = item.isUserAdded;

            return (
              <div
                key={`portfolio-item-${item.id || itmIdx}-${itmIdx}`}
                onClick={() => handleOpenCard(item)}
                className={`bg-[var(--surface)] border rounded-2xl overflow-hidden card-hover-glow flex flex-col justify-between group cursor-pointer transition-all duration-300 relative ${
                  isUserItem
                    ? 'border-[var(--primary)]/60 shadow-lg shadow-[var(--glow)]/20'
                    : 'border-[var(--line)] hover:border-[var(--secondary)]/60'
                }`}
              >
                <div>
                  {/* Visual Media Container (NO heavy black scrim, vivid & bright!) */}
                  <div className="h-56 bg-[var(--surface-2)] border-b border-[var(--line)] relative overflow-hidden flex flex-col justify-between p-4">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-radial from-[var(--secondary)]/20 via-transparent to-transparent flex items-center justify-center">
                        <i className="fa-solid fa-layer-group text-4xl text-[var(--muted)] opacity-60"></i>
                      </div>
                    )}

                    {/* Subtle, non-dimming gradient for badges and labels */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Top Badges & Quick Action Buttons */}
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--secondary)] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/15">
                        {item.categoryLabel}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isUserItem ? (
                          <span className="text-[11px] font-bold text-[#070D18] bg-gradient-to-r from-amber-300 to-amber-500 px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                            <span>✨</span>
                            <span>Recent</span>
                          </span>
                        ) : item.badge ? (
                          <span className="text-[11px] font-bold text-[#070D18] bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-2.5 py-0.5 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Bottom Info Bar & Asset Counter */}
                    <div className="flex items-center justify-between text-white/90 font-mono text-[11px] relative z-10 mt-auto">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-sans flex items-center gap-1.5 text-white">
                        <i className="fa-solid fa-images text-[var(--secondary)]"></i>
                        <span>
                          {cardImages.length > 0
                            ? `${cardImages.length} ${cardImages.length === 1 ? 'Asset' : 'Assets'}`
                            : 'Interactive Showcase'}
                        </span>
                      </span>

                      <span className="text-[var(--secondary)] text-xs font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Open Full-Screen</span>
                        <i className="fa-solid fa-arrow-right text-[10px]"></i>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-[var(--text)] mb-1 group-hover:text-[var(--secondary)] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-xs font-semibold text-[var(--secondary)] mb-2">
                      {item.subtitle}
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Tools Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--line)]">
                      {item.tools.slice(0, 3).map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]"
                        >
                          {tool}
                        </span>
                      ))}
                      {item.tools.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-[var(--muted)]">
                          +{item.tools.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCard(item);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs transition-opacity hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[var(--glow)]"
                  >
                    <i className="fa-solid fa-expand text-[11px]"></i>
                    <span>Open Full-Screen</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================================
            CATEGORY-SPECIFIC CLIENT REVIEWS (Manual Single-Line Carousel, 3 visible on desktop)
            ===================================================================== */}
        <div className="mt-24 pt-16 border-t border-[var(--line)]">
          {/* Header & Navigation controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
                Service Client Reviews
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-4xl text-[var(--text)] mt-1">
                Client Feedback for {currentCategoryLabel}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-2">
                Verified testimonials from Pakistani and international brands. Browse reviews in a single line with smooth swipe, drag, or arrow controls.
              </p>
            </div>

            {/* Controls: Mode badge & Prev/Next arrows */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--muted)] flex items-center gap-2 select-none">
                <i className="fa-solid fa-arrows-left-right text-[var(--secondary)]"></i>
                <span>Manual Swipe & Arrows</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevReview}
                  aria-label="Previous review"
                  title="Previous review"
                  className="w-10 h-10 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--secondary)] text-[var(--text)] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button
                  onClick={handleNextReview}
                  aria-label="Next review"
                  title="Next review"
                  className="w-10 h-10 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--secondary)] text-[var(--text)] flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Manual Scroll & Drag Track (3 Visible Cards on Desktop, Square 1:1 Boxes in One Line) */}
          <div
            ref={reviewsTrackRef}
            onScroll={handleReviewsScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 -mx-3 [&::-webkit-scrollbar]:hidden ${
              isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {currentReviews.map((rev, idx) => (
              <div
                key={`srv-rev-${rev.id}-${idx}`}
                className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-3 snap-start select-none"
              >
                {/* Square Box Card (1:1 Aspect Ratio) */}
                <div className="w-full aspect-square max-w-[340px] mx-auto bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--secondary)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 card-hover-glow flex flex-col justify-between relative overflow-hidden group select-none shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--secondary)]/10 to-transparent rounded-bl-full pointer-events-none" />

                  {/* Top: Star rating & verified badge */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {Array.from({ length: rev.rating || 5 }).map((_, s) => (
                          <i key={s} className="fa-solid fa-star"></i>
                        ))}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--line)] flex items-center gap-1">
                        <i className="fa-solid fa-circle-check text-[9px] text-[#00E5FF]"></i>
                        <span>Verified</span>
                      </span>
                    </div>

                    <p className="text-xs sm:text-[13px] text-[var(--text)] font-medium leading-relaxed italic line-clamp-5">
                      "{rev.quote}"
                    </p>
                  </div>

                  {/* Bottom: Client Profile */}
                  <div className="pt-3 border-t border-[var(--line)] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] p-0.5 shrink-0">
                      <div className="w-full h-full rounded-full bg-[#070D18] flex items-center justify-center font-bold text-xs text-[var(--secondary)]">
                        {rev.name.charAt(0)}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-[var(--text)] truncate">
                        {rev.name}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        {rev.role} • <span className="text-[var(--secondary)] font-medium">{rev.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {totalReviews > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {currentReviews.map((rev, dotIdx) => {
                const isActive = dotIdx === activeReviewIndex;
                return (
                  <button
                    key={`srv-dot-${rev.id}-${dotIdx}`}
                    onClick={() => scrollToIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'w-8 bg-[var(--secondary)] shadow-sm shadow-[var(--glow)]'
                        : 'w-2 bg-[var(--line)] hover:bg-[var(--muted)]'
                    }`}
                    aria-label={`Go to review ${dotIdx + 1} (${rev.name})`}
                    title={`Jump to review by ${rev.name}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Production Package Section */}
        <div className="mt-20 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] border border-[var(--line)] rounded-[24px] p-8 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[var(--secondary)]">
                Bespoke Engagements
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-4xl text-[var(--text)]">
                Need a custom creative production package?
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
                We bundle post-production, monthly UGC direct-response creatives, YouTube scaling kits, and dedicated prompt engineering into tailored monthly retainers.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-sm shadow-xl shadow-[var(--glow)] hover:opacity-95 transition-all text-center cursor-pointer"
              >
                Configure Custom Package →
              </button>
              <a
                href="https://wa.me/923244528683"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] transition-all text-center flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-[#25D366]"></i>
                <span>Ask on WhatsApp (03244528683)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD NEW PROJECT / FOLDER / BATCH WORK
          ========================================================================= */}
      {isAddingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddingProject(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center text-sm cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--secondary)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded-md border border-[var(--line)]">
                Portfolio Studio
              </span>
              {targetSubCategory && (
                <span className="text-[11px] font-semibold text-amber-400">
                  Target: {targetSubCategory}
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-2xl text-[var(--text)] mt-1 mb-1">
              Add Project / Folder Assets
            </h3>
            <p className="text-xs text-[var(--muted)] mb-6">
              Upload multiple images or entire folders for Brand Identity, YouTube Thumbnails, Video Edits, or Ads. New additions will be pinned to Recent Projects at the top!
            </p>

            <form onSubmit={handleAddProjectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Apex Nitro Brand Identity & Social Kit"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Primary Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  >
                    {PORTFOLIO_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#070D18]">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">
                    Specific Service Box / Category
                  </label>
                  <select
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  >
                    {(SERVICE_SUB_CATEGORIES[newCategory] || []).map((sub) => (
                      <option key={sub} value={sub} className="bg-[#070D18]">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Subtitle / Deliverable</label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="e.g. 5x High-CTR Thumbnails + Master PSDs"
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Tools / Software Used</label>
                  <input
                    type="text"
                    value={newTools}
                    onChange={(e) => setNewTools(e.target.value)}
                    placeholder="e.g. Photoshop, Illustrator, Figma, Midjourney"
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">Project Description & Results</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the brief, creative direction, retention pacing, CTR results, or design rationale..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                />
              </div>

              {/* Multi-Image Upload Area */}
              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">
                  Upload Project Images / Gallery (Select multiple images or folder)
                </label>
                <div className="border-2 border-dashed border-[var(--line)] hover:border-[var(--secondary)] rounded-2xl p-4 text-center transition-colors bg-[var(--surface-2)]/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesUpload}
                    id="add-project-files"
                    className="hidden"
                  />
                  <label
                    htmlFor="add-project-files"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] text-[var(--secondary)] flex items-center justify-center text-xl">
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div className="font-semibold text-sm text-[var(--text)]">
                      {isCompressing ? 'Optimizing & Compressing Images...' : 'Click to Browse Images or Drop Files Here'}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] max-w-sm">
                      Supports JPG, PNG, WEBP. You can select multiple images at once to create a complete project album!
                    </p>
                  </label>

                  {/* Previews of newly uploaded images */}
                  {newImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-[var(--line)]">
                      {newImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl overflow-hidden relative border border-[var(--line)] group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center text-[9px] hover:scale-110 transition-transform"
                            title="Remove image"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 text-[8px] bg-black/80 text-white px-1 rounded font-bold">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--surface-2)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompressing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[var(--glow)] hover:opacity-95 transition-all cursor-pointer"
                >
                  Save Project to Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT ANY PROJECT (Demo or Custom)
          ========================================================================= */}
      {projectToEdit && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProjectToEdit(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center text-sm cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--secondary)] bg-[var(--surface-2)] px-2.5 py-0.5 rounded-md border border-[var(--line)]">
                Editor Studio
              </span>
              <span className="text-[11px] font-semibold text-amber-400">
                {projectToEdit.isUserAdded ? 'Custom Project' : 'Default Demo Project'}
              </span>
            </div>

            <h3 className="font-display font-bold text-2xl text-[var(--text)] mt-1 mb-1">
              Edit Project & Replace Media
            </h3>
            <p className="text-xs text-[var(--muted)] mb-6">
              Update titles, descriptions, tools, and delete or replace existing photos (including default demo images) with your own artwork.
            </p>

            <form onSubmit={handleSaveProjectEdits} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  >
                    {PORTFOLIO_CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#070D18]">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Specific Service Box</label>
                  <select
                    value={editSubCategory}
                    onChange={(e) => setEditSubCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  >
                    {(SERVICE_SUB_CATEGORIES[editCategory] || []).map((sub) => (
                      <option key={sub} value={sub} className="bg-[#070D18]">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Subtitle / Deliverable</label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text)] mb-1">Tools / Software (comma-separated)</label>
                  <input
                    type="text"
                    value={editTools}
                    onChange={(e) => setEditTools(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">Description & Creative Brief</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text)] mb-1">Vector Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--secondary)]"
                />
              </div>

              {/* Photos Management: Delete existing or upload replacement */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-semibold text-[var(--text)]">
                    Project Images ({editImages.length})
                  </label>
                  <span className="text-[11px] text-[var(--muted)]">
                    Click '✕' on any photo to remove demo pictures
                  </span>
                </div>

                {/* Thumbnails of current images */}
                {editImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] mb-3">
                    {editImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-xl overflow-hidden relative border border-[var(--line)] group bg-black"
                      >
                        <img
                          src={imgUrl}
                          alt={`Asset ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Delete this photo"
                        >
                          <i className="fa-solid fa-trash text-[10px]"></i>
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 text-[9px] bg-black/85 text-white px-1.5 py-0.2 rounded font-bold">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-center mb-3">
                    <p className="text-xs">No images in this project! Please upload at least one image below.</p>
                  </div>
                )}

                {/* File picker to add more or replace */}
                <div className="border border-dashed border-[var(--line)] hover:border-[var(--secondary)] rounded-2xl p-4 text-center transition-colors bg-[var(--surface-2)]/40">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditFilesUpload}
                    id="edit-project-files"
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-project-files"
                    className="cursor-pointer flex items-center justify-center gap-2 py-1 text-[var(--secondary)] hover:underline"
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span className="font-semibold text-xs">
                      {isCompressing ? 'Compressing...' : '+ Upload New / Replacement Photos'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => {
                    setProjectToEdit(null);
                    setProjectToDelete(projectToEdit);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-trash text-xs"></i>
                  <span>Delete Project</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectToEdit(null)}
                    className="px-4 py-2.5 rounded-xl bg-[var(--surface-2)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCompressing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[var(--glow)] hover:opacity-95 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE CONFIRMATION
          ========================================================================= */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[var(--surface)] border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center text-2xl mx-auto mb-4 border border-red-500/20">
              <i className="fa-solid fa-trash-can"></i>
            </div>

            <h3 className="font-display font-bold text-xl text-[var(--text)] mb-2">
              Delete Project?
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed mb-6">
              Are you sure you want to remove <strong>"{projectToDelete.title}"</strong> from your showcase? It will no longer appear on the website.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--line)] text-xs font-semibold text-[var(--text)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-red-600/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TRUE FULL-SCREEN PROJECT VIEW (Hides entire website Header & Footer!)
          ========================================================================= */}
      {selectedCard && (() => {
        const currentImages = getCardImages(selectedCard);
        const activeImg = currentImages[selectedImageIndex] || currentImages[0] || selectedCard.customImage;

        return (
          <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#050912] text-white flex flex-col overflow-hidden select-none animate-in fade-in">
            {/* FULLSCREEN TOP NAVIGATION BAR */}
            <header className="h-16 sm:h-20 px-4 sm:px-8 border-b border-white/10 bg-[#070D18]/95 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
              {/* Left: Prominent BACK button + Category badge */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseFullscreen}
                  className="px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-[var(--secondary)] hover:text-[#070D18] text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer border border-white/15 shadow-sm active:scale-95"
                  title="Go back to services page (Esc)"
                >
                  <i className="fa-solid fa-arrow-left text-xs"></i>
                  <span>Back to Website</span>
                </button>

                <div className="hidden md:flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--secondary)] bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    {selectedCard.categoryLabel}
                  </span>
                  {selectedCard.subCategory && (
                    <span className="text-[11px] text-white/80 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                      {selectedCard.subCategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Center: Project Title and Asset Counter */}
              <div className="hidden sm:flex flex-col items-center text-center max-w-md mx-2 truncate">
                <div className="font-display font-bold text-sm sm:text-base text-white truncate max-w-xs md:max-w-md">
                  {selectedCard.title}
                </div>
                {currentImages.length > 0 && (
                  <div className="text-[11px] text-[var(--secondary)] font-mono">
                    Image {selectedImageIndex + 1} of {currentImages.length}
                  </div>
                )}
              </div>

              {/* Right: Actions Bar (Fullscreen toggle, Close) */}
              <div className="flex items-center gap-2">
                {/* Native Fullscreen Toggle */}
                <button
                  onClick={toggleNativeFullscreen}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors border border-white/15 cursor-pointer"
                  title={isNativeFullscreen ? 'Exit browser fullscreen' : 'Full window fullscreen (F11)'}
                >
                  <i className={`fa-solid ${isNativeFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
                </button>

                {/* Close Button */}
                <button
                  onClick={handleCloseFullscreen}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center text-sm transition-colors border border-white/15 cursor-pointer"
                  aria-label="Close fullscreen"
                  title="Close (Esc)"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </header>

            {/* FULLSCREEN MAIN CANVAS (Active Media: Prompt Blueprint, Video Player, or Image) */}
            <main className="flex-1 relative flex items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-6">
              {selectedCard.category === 'prompt-engineering' ? (
                <div className="w-full max-w-4xl mx-auto bg-[#0A101D] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
                  {/* Top: DP / Thumbnail + Meta info */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-white/10 pb-6">
                    {activeImg ? (
                      <img
                        src={activeImg}
                        alt={selectedCard.title}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[var(--secondary)]/60 shadow-xl shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[var(--surface-2)] border border-white/10 flex items-center justify-center text-[var(--secondary)] text-3xl shrink-0">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      </div>
                    )}
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--secondary)] bg-[var(--secondary)]/10 px-2.5 py-1 rounded-md border border-[var(--secondary)]/30 font-bold">
                          AI Prompt Engineering
                        </span>
                        {selectedCard.subCategory && (
                          <span className="text-[10px] font-mono text-white/70 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                            {selectedCard.subCategory}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-1">
                        {selectedCard.title}
                      </h2>
                      {selectedCard.subtitle && (
                        <p className="text-xs sm:text-sm text-[var(--secondary)] font-medium">
                          {selectedCard.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Prompt Text Box with Copy Button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--secondary)] flex items-center gap-2 font-bold">
                        <i className="fa-solid fa-terminal text-[11px]"></i>
                        Prompt Blueprint & Syntax
                      </span>
                      <button
                        onClick={() => {
                          const textToCopy = selectedCard.description || selectedCard.title;
                          navigator.clipboard.writeText(textToCopy);
                          setCopiedPrompt(true);
                          setTimeout(() => setCopiedPrompt(false), 2500);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--secondary)]/15 hover:bg-[var(--secondary)] text-[var(--secondary)] hover:text-[#070D18] font-bold text-xs flex items-center gap-1.5 transition-all border border-[var(--secondary)]/30 cursor-pointer active:scale-95 shadow-sm"
                      >
                        <i className={`fa-solid ${copiedPrompt ? 'fa-check text-emerald-400' : 'fa-copy'}`}></i>
                        <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
                      </button>
                    </div>

                    <div className="relative group">
                      <div className="bg-[#050912] border border-white/15 rounded-xl p-4 sm:p-5 text-white/90 font-mono text-xs sm:text-sm leading-relaxed max-h-[35vh] overflow-y-auto select-all whitespace-pre-wrap shadow-inner">
                        {selectedCard.description || 'No prompt text specified for this asset.'}
                      </div>
                    </div>
                  </div>

                  {/* Metadata / Tools / Recommended Engines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-white/40 block mb-1 text-[10px] uppercase font-mono tracking-wider">
                        Compatible AI Engines & Tools
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCard.tools.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-white/40 block mb-1 text-[10px] uppercase font-mono tracking-wider">
                        Production Tags & Style Focus
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCard.tags.map((tg, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-[var(--secondary)]/10 text-[var(--secondary)] font-mono text-[11px]">
                            #{tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedCard.videoUrl || (activeImg && (activeImg.startsWith('data:video/') || activeImg.endsWith('.mp4') || activeImg.endsWith('.webm') || activeImg.endsWith('.mov'))) ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <video
                    src={selectedCard.videoUrl || activeImg}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[calc(100vh-170px)] sm:max-h-[calc(100vh-180px)] rounded-2xl shadow-2xl border border-white/10 bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : activeImg ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={activeImg}
                    alt={selectedCard.title}
                    className="max-w-full max-h-[calc(100vh-170px)] sm:max-h-[calc(100vh-180px)] object-contain rounded-xl shadow-2xl transition-all duration-300"
                  />
                </div>
              ) : (
                <div className="text-center text-white/50 p-8">
                  <i className="fa-solid fa-layer-group text-6xl mb-4 opacity-40"></i>
                  <p className="text-base font-semibold">Interactive Showcase Asset</p>
                  <p className="text-xs text-white/40 mt-1">Full case study and creative deliverables loaded</p>
                </div>
              )}

              {/* Previous Image Arrow */}
              {currentImages.length > 1 && (
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      (prev) => (prev - 1 + currentImages.length) % currentImages.length
                    )
                  }
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 hover:bg-[var(--secondary)] hover:text-[#070D18] text-white flex items-center justify-center transition-all border border-white/20 shadow-2xl cursor-pointer hover:scale-110 active:scale-95 z-30"
                  aria-label="Previous image (Left Arrow)"
                  title="Previous image"
                >
                  <i className="fa-solid fa-chevron-left text-base sm:text-lg"></i>
                </button>
              )}

              {/* Next Image Arrow */}
              {currentImages.length > 1 && (
                <button
                  onClick={() =>
                    setSelectedImageIndex((prev) => (prev + 1) % currentImages.length)
                  }
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/70 hover:bg-[var(--secondary)] hover:text-[#070D18] text-white flex items-center justify-center transition-all border border-white/20 shadow-2xl cursor-pointer hover:scale-110 active:scale-95 z-30"
                  aria-label="Next image (Right Arrow)"
                  title="Next image"
                >
                  <i className="fa-solid fa-chevron-right text-base sm:text-lg"></i>
                </button>
              )}

              {/* Bottom Left: Counter Overlay */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-mono border border-white/20 flex items-center gap-2 z-20">
                  <i className="fa-solid fa-images text-[var(--secondary)]"></i>
                  <span>
                    Asset {selectedImageIndex + 1} of {currentImages.length}
                  </span>
                </div>
              )}

              {/* Bottom Right: Details Toggle Button */}
              <button
                onClick={() => setIsFullscreenDetailsOpen(!isFullscreenDetailsOpen)}
                className="absolute bottom-4 right-4 bg-black/80 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold border border-white/20 flex items-center gap-2 z-20 cursor-pointer transition-colors"
              >
                <i className="fa-solid fa-circle-info text-[var(--secondary)]"></i>
                <span>{isFullscreenDetailsOpen ? 'Hide Info' : 'Project Info & Specs'}</span>
              </button>
            </main>

            {/* EXPANDABLE DETAILS DRAWER */}
            {isFullscreenDetailsOpen && (
              <div className="border-t border-white/10 bg-[#070D18]/95 backdrop-blur-xl px-4 sm:px-8 py-4 shrink-0 max-h-48 overflow-y-auto animate-in slide-in-from-bottom duration-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base sm:text-lg text-white">
                        {selectedCard.title}
                      </h3>
                      <span className="text-xs text-[var(--secondary)] font-semibold">
                        • {selectedCard.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {selectedCard.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-white/50">Tools:</span>
                      {selectedCard.tools.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/80 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/923244528683?text=${encodeURIComponent(
                        `Hi Ahsan! I am looking at your "${selectedCard.title}" project on Horizon and want to commission similar work.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#25D366] text-[#070D18] font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity"
                    >
                      <i className="fa-brands fa-whatsapp text-sm"></i>
                      <span>WhatsApp Ahsan</span>
                    </a>
                    <button
                      onClick={() => {
                        handleCloseFullscreen();
                        onNavigate('contact');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-[#070D18] font-bold text-xs hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      Commission Work →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FULLSCREEN BOTTOM THUMBNAILS STRIP */}
            {currentImages.length > 1 && (
              <footer className="h-20 sm:h-24 px-4 sm:px-8 border-t border-white/10 bg-[#070D18]/90 backdrop-blur-xl flex items-center justify-center shrink-0 z-20">
                <div className="flex items-center gap-3 overflow-x-auto max-w-full py-2 no-scrollbar">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-14 sm:h-16 aspect-video shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative ${
                        selectedImageIndex === idx
                          ? 'border-[var(--secondary)] scale-105 shadow-lg shadow-[var(--glow)] ring-2 ring-[var(--secondary)]/50'
                          : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/60'
                      }`}
                      title={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </footer>
            )}
          </div>
        );
      })()}
    </div>
  );
};
