import { EscrowService } from '../backend/src/escrow/escrow.service';

describe('EscrowService', () => {
  let service: EscrowService;
  beforeEach(() => { service = new EscrowService(); });

  it('creates an escrow with pending status', async () => {
    const e = await service.create('GABC...1', 'GXYZ...2', '100');
    expect(e.status).toBe('pending');
    expect(e.depositor).toBe('GABC...1');
  });

  it('finds escrow by id', async () => {
    const e = await service.create('GABC...1', 'GXYZ...2', '50');
    const found = await service.findById(e.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(e.id);
  });

  it('releases an escrow', async () => {
    const e = await service.create('G1', 'G2', '200');
    const released = await service.release(e.id);
    expect(released.status).toBe('released');
  });

  it('throws on release of non-existent escrow', async () => {
    await expect(service.release('non-existent')).rejects.toThrow('Escrow not found');
  });
});
