// ===========================================
// Tests unitaires - analyticsStore - P3 Dashboard
// ===========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalyticsStore } from '../analyticsStore';
import { analyticsApi } from '../../services/analyticsApi';

// Mock de l'API
vi.mock('../../services/analyticsApi', () => ({
  analyticsApi: {
    getOverview: vi.fn(),
    getActivity: vi.fn(),
    getDistribution: vi.fn(),
    getTopNotes: vi.fn(),
    getUserContributions: vi.fn(),
  },
}));

describe('analyticsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAnalyticsStore.setState({
      overview: null,
      activity: null,
      statusDistribution: [],
      priorityDistribution: [],
      tagsDistribution: [],
      topNotes: [],
      userContributions: [],
      isLoadingOverview: false,
      isLoadingActivity: false,
      isLoadingDistributions: false,
      isLoadingTopNotes: false,
      isLoadingContributions: false,
      error: null,
      activityDays: 30,
    });
  });

  describe('initial state', () => {
    it('should have null overview initially', () => {
      expect(useAnalyticsStore.getState().overview).toBeNull();
    });

    it('should have empty distributions initially', () => {
      const state = useAnalyticsStore.getState();
      expect(state.statusDistribution).toEqual([]);
      expect(state.priorityDistribution).toEqual([]);
      expect(state.tagsDistribution).toEqual([]);
    });

    it('should have 30 days as default activity period', () => {
      expect(useAnalyticsStore.getState().activityDays).toBe(30);
    });
  });

  describe('loadOverview', () => {
    it('should set isLoadingOverview to true while loading', async () => {
      vi.mocked(analyticsApi.getOverview).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({} as any), 100))
      );

      const promise = useAnalyticsStore.getState().loadOverview();
      expect(useAnalyticsStore.getState().isLoadingOverview).toBe(true);

      await promise;
      expect(useAnalyticsStore.getState().isLoadingOverview).toBe(false);
    });

    it('should update overview on success', async () => {
      const mockOverview = {
        totalNotes: 100,
        totalFolders: 20,
        activeUsers: 5,
        notesCreatedThisWeek: 10,
        notesModifiedThisWeek: 25,
        totalViews: 500,
      };

      vi.mocked(analyticsApi.getOverview).mockResolvedValue(mockOverview);

      await useAnalyticsStore.getState().loadOverview();

      expect(useAnalyticsStore.getState().overview).toEqual(mockOverview);
    });

    it('should set error on failure', async () => {
      vi.mocked(analyticsApi.getOverview).mockRejectedValue(new Error('API Error'));

      await useAnalyticsStore.getState().loadOverview();

      expect(useAnalyticsStore.getState().error).toBe('API Error');
      expect(useAnalyticsStore.getState().overview).toBeNull();
    });
  });

  describe('loadDistributions', () => {
    it('should load all distributions in parallel', async () => {
      vi.mocked(analyticsApi.getDistribution)
        .mockResolvedValueOnce([{ label: 'todo', count: 10 }])
        .mockResolvedValueOnce([{ label: 'high', count: 5 }])
        .mockResolvedValueOnce([{ label: 'work', count: 8 }]);

      await useAnalyticsStore.getState().loadDistributions();

      const state = useAnalyticsStore.getState();
      expect(state.statusDistribution).toEqual([{ label: 'todo', count: 10 }]);
      expect(state.priorityDistribution).toEqual([{ label: 'high', count: 5 }]);
      expect(state.tagsDistribution).toEqual([{ label: 'work', count: 8 }]);
    });
  });

  describe('setActivityDays', () => {
    it('should update activityDays and reload activity', async () => {
      vi.mocked(analyticsApi.getActivity).mockResolvedValue({
        creations: [],
        modifications: [],
      });

      useAnalyticsStore.getState().setActivityDays(7);

      expect(useAnalyticsStore.getState().activityDays).toBe(7);
      expect(analyticsApi.getActivity).toHaveBeenCalledWith(7);
    });
  });

  describe('clearError', () => {
    it('should clear the error', () => {
      useAnalyticsStore.setState({ error: 'Some error' });

      useAnalyticsStore.getState().clearError();

      expect(useAnalyticsStore.getState().error).toBeNull();
    });
  });

  describe('loadAll', () => {
    it('should call all load functions in parallel', async () => {
      vi.mocked(analyticsApi.getOverview).mockResolvedValue({} as any);
      vi.mocked(analyticsApi.getActivity).mockResolvedValue({
        creations: [],
        modifications: [],
      });
      vi.mocked(analyticsApi.getDistribution).mockResolvedValue([]);
      vi.mocked(analyticsApi.getTopNotes).mockResolvedValue([]);
      vi.mocked(analyticsApi.getUserContributions).mockResolvedValue([]);

      await useAnalyticsStore.getState().loadAll();

      expect(analyticsApi.getOverview).toHaveBeenCalled();
      expect(analyticsApi.getActivity).toHaveBeenCalled();
      expect(analyticsApi.getDistribution).toHaveBeenCalledTimes(3);
      expect(analyticsApi.getTopNotes).toHaveBeenCalled();
      expect(analyticsApi.getUserContributions).toHaveBeenCalled();
    });
  });
});
