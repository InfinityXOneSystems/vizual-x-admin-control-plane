/**
 * Core Taxonomy Definitions
 * Sourced from InfinityXOneSystems/taxonomy-system
 */

export interface TaxonomyItem {
  /** Unique identifier for the taxonomy item */
  id: string;
  
  /** Display name of the taxonomy item */
  name: string;
  
  /** Detailed description of the taxonomy item */
  description?: string;
  
  /** ID of the parent taxonomy item, if any */
  parent_id?: string;
  
  /** Additional metadata for the taxonomy item */
  metadata?: Record<string, any>;
}

export interface TaxonomySystem {
  version: string;
  lastUpdated: string;
  items: TaxonomyItem[];
}
