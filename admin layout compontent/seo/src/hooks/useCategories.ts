import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useHubSpot } from '@/contexts/HubSpotContext';

export interface TagCategory {
  id: string;
  name: string;
  color: string;
  description?: string;
  tagIds: string[];
  createdAt: Date;
}

export function useCategories() {
  const { connectionStatus } = useHubSpot();
  const userId = connectionStatus.portalId || 'anonymous';
  
  // Query categories from Convex
  const convexCategories = useQuery(api.categories.getCategories, { userId }) || [];
  
  // Convert to TagCategory format
  const categories: TagCategory[] = convexCategories.map(cat => ({
    id: cat._id,
    name: cat.name,
    color: cat.color,
    description: cat.description,
    tagIds: cat.tagIds,
    createdAt: new Date(cat.createdAt),
  }));
  
  // Mutations
  const createCategoryMutation = useMutation(api.categories.createCategory);
  const updateCategoryMutation = useMutation(api.categories.updateCategory);
  const deleteCategoryMutation = useMutation(api.categories.deleteCategory);
  
  // Create category
  const createCategory = async (data: Omit<TagCategory, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const categoryId = await createCategoryMutation({
        ...data,
        userId,
      });
      return categoryId;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  };
  
  // Update category
  const updateCategory = async (id: string, data: Partial<Omit<TagCategory, 'id' | 'createdAt' | 'userId'>>) => {
    try {
      await updateCategoryMutation({
        id: id as Id<"categories">,
        ...data,
      });
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  };
  
  // Delete category
  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryMutation({ id: id as Id<"categories"> });
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    }
  };
  
  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
