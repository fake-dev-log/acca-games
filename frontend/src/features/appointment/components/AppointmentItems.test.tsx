import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PersonItems, AppointmentOptions } from './AppointmentItems';

describe('AppointmentItems — 요일 라운드', () => {
  it('shows only the person\'s day cards, in the given order', () => {
    const { container } = render(<PersonItems round={1} items={['일', '금', '목']} />);
    expect(container.textContent).toBe('일금목');
    expect(screen.queryByText('월')).not.toBeInTheDocument();
  });

  it('shows all seven days, Monday first, only on the final question', () => {
    render(<AppointmentOptions round={1} options={['월', '화', '수', '목', '금', '토', '일']} disabled={false} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['월', '화', '수', '목', '금', '토', '일']);
  });
});
