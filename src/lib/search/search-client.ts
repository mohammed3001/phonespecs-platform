/**
 * Search Client (Adapter)
 *
 * Wraps the Meilisearch SDK to provide:
 * - Single point of SDK interaction
 * - Connection error handling
 * - Easy mocking for tests
 * - Reduced coupling with the rest of the codebase
 *
 * No other file should import from "meilisearch" directly.
 */

import { Meilisearch, type SearchParams, type SearchResponse } from "meilisearch";
import { searchLogger } from "./search-logger";

/** Meilisearch client configuration */
interface SearchClientConfig {
  host: string;
  apiKey: string;
}

function getConfig(): SearchClientConfig {
  return {
    host: process.env.MEILISEARCH_URL || "http://localhost:7700",
    apiKey: process.env.MEILISEARCH_MASTER_KEY || "mp_dev_master_key_change_in_production",
  };
}

/** Lazy singleton — created on first access, not at module load */
let clientInstance: Meilisearch | null = null;

function getClient(): Meilisearch {
  if (!clientInstance) {
    const config = getConfig();
    clientInstance = new Meilisearch({ host: config.host, apiKey: config.apiKey });
  }
  return clientInstance;
}

/**
 * SearchClient — adapter over Meilisearch SDK.
 *
 * All Meilisearch interactions go through this module.
 * If Meilisearch needs to be replaced, only this file changes.
 */
export const searchClient = {
  /** Search an index with typed results */
  async search<T>(
    indexName: string,
    query: string,
    params?: SearchParams
  ): Promise<SearchResponse<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getClient().index(indexName).search(query, params) as Promise<SearchResponse<T>>;
  },

  /** Add or update documents in an index */
  async addDocuments(
    indexName: string,
    documents: Record<string, unknown>[],
    options?: { primaryKey?: string }
  ): Promise<{ taskUid: number }> {
    const index = getClient().index(indexName);
    return index.addDocuments(documents, options);
  },

  /** Delete a single document by ID */
  async deleteDocument(indexName: string, documentId: string): Promise<{ taskUid: number }> {
    const index = getClient().index(indexName);
    return index.deleteDocument(documentId);
  },

  /** Delete all documents in an index */
  async deleteAllDocuments(indexName: string): Promise<{ taskUid: number }> {
    const index = getClient().index(indexName);
    return index.deleteAllDocuments();
  },

  /** Wait for a task to complete */
  async waitForTask(taskUid: number, timeoutMs = 30000): Promise<void> {
    await getClient().tasks.waitForTask(taskUid, { timeout: timeoutMs });
  },

  /** Check if Meilisearch is healthy */
  async isHealthy(): Promise<boolean> {
    try {
      await getClient().health();
      return true;
    } catch (error) {
      searchLogger.serviceUnavailable("health", error);
      return false;
    }
  },

  /** Configure index settings (searchable, filterable, sortable, etc.) */
  async configureIndex(
    indexName: string,
    settings: {
      searchableAttributes?: string[];
      filterableAttributes?: string[];
      sortableAttributes?: string[];
      rankingRules?: string[];
      typoTolerance?: {
        enabled?: boolean;
        minWordSizeForTypos?: { oneTypo?: number; twoTypos?: number };
        disableOnAttributes?: string[];
      };
      synonyms?: Record<string, string[]>;
      pagination?: { maxTotalHits?: number };
      faceting?: { maxValuesPerFacet?: number };
    }
  ): Promise<void> {
    const index = getClient().index(indexName);

    if (settings.searchableAttributes) {
      await index.updateSearchableAttributes(settings.searchableAttributes);
    }
    if (settings.filterableAttributes) {
      await index.updateFilterableAttributes(settings.filterableAttributes);
    }
    if (settings.sortableAttributes) {
      await index.updateSortableAttributes(settings.sortableAttributes);
    }
    if (settings.rankingRules) {
      await index.updateRankingRules(settings.rankingRules);
    }
    if (settings.typoTolerance) {
      await index.updateTypoTolerance(settings.typoTolerance);
    }
    if (settings.synonyms) {
      await index.updateSynonyms(settings.synonyms);
    }
    if (settings.pagination) {
      await index.updatePagination(settings.pagination);
    }
    if (settings.faceting) {
      await index.updateFaceting(settings.faceting);
    }
  },

  /** Reset the singleton (for testing) */
  _resetForTesting(): void {
    clientInstance = null;
  },
};
