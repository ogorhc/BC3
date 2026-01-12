import { ConceptNode } from '../ConceptNode';

/**
 * Resource type classification for BC3 concepts.
 */
export enum ResourceType {
  /** 0 - Unclassified */
  UNCLASSIFIED = 0,
  /** 1 - Labor (Mano de obra) */
  LABOR = 1,
  /** 2 - Machinery and auxiliary means (Maquinaria y medios auxiliares) */
  MACHINERY = 2,
  /** 3 - Materials (Materiales) */
  MATERIALS = 3,
  /** 4 - Additional waste components (Componentes adicionales de residuo) */
  ADDITIONAL_WASTE = 4,
  /** 5 - Waste classification (Clasificación de residuo) */
  WASTE_CLASSIFICATION = 5,
}

/**
 * Resource type labels in English.
 */
export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  [ResourceType.UNCLASSIFIED]: 'Unclassified',
  [ResourceType.LABOR]: 'Labor',
  [ResourceType.MACHINERY]: 'Machinery and auxiliary means',
  [ResourceType.MATERIALS]: 'Materials',
  [ResourceType.ADDITIONAL_WASTE]: 'Additional waste components',
  [ResourceType.WASTE_CLASSIFICATION]: 'Waste classification',
};

/**
 * Represents an occurrence of a decomposed concept within a parent unit of work.
 */
export interface ResourceOccurrence {
  /** Parent concept node (unit of work) */
  parent: ConceptNode;
  /** Parent quantity (from measurement total) */
  parentQuantity: number | undefined;
  /** Child performance/rendimiento from decomposition */
  childPerformance: number | undefined;
  /** Calculated total: parentQuantity × childPerformance */
  calculatedTotal: number | undefined;
}

/**
 * Represents a decomposed concept (child) grouped by resource type.
 */
export interface ResourceConcept {
  /** The concept node (child) */
  concept: ConceptNode;
  /** All occurrences of this concept in different parent units of work */
  occurrences: ResourceOccurrence[];
}

/**
 * Represents a resource type group containing all decomposed concepts of that type.
 */
export interface ResourceTypeGroup {
  /** Resource type (0-5) */
  type: ResourceType;
  /** Type label in English */
  typeLabel: string;
  /** All decomposed concepts of this type */
  concepts: ResourceConcept[];
}

/**
 * Complete resource hierarchy structure grouped by resource type.
 */
export interface ResourceHierarchy {
  /** Groups indexed by resource type (0-5) */
  groups: Map<ResourceType, ResourceTypeGroup>;
  /** Total number of decomposed concepts across all types */
  totalConcepts: number;
}
