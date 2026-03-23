import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('application config API helpers', () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it('loads application pipeline config from the config endpoint', async () => {
    apiFetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ statuses: ['Applied', 'Interview'] }),
    });

    const { fetchApplicationsConfig } = await import('@/lib/api/config');

    await expect(fetchApplicationsConfig()).resolves.toEqual({
      statuses: ['Applied', 'Interview'],
    });
    expect(apiFetchMock).toHaveBeenCalledWith('/config/applications', {
      credentials: 'include',
    });
  });

  it('preserves backend affected applications when pipeline update is rejected', async () => {
    apiFetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({
        detail: {
          message: 'Cannot remove application statuses that are still in use.',
          affected_applications: [
            {
              application_id: 'application-1',
              company: 'Acme',
              role: 'Engineer',
              status: 'Applied',
            },
          ],
        },
      }),
    });

    const { ApplicationsConfigError, updateApplicationsConfig } = await import('@/lib/api/config');

    await expect(updateApplicationsConfig({ statuses: ['Interview'] })).rejects.toMatchObject({
      name: 'ApplicationsConfigError',
      message: 'Cannot remove application statuses that are still in use.',
      affectedApplications: [
        {
          application_id: 'application-1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Applied',
        },
      ],
    });

    expect(ApplicationsConfigError).toBeDefined();
  });
});
