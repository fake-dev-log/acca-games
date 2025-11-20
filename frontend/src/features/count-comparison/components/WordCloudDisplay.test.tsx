import { render, screen } from '@testing-library/react';
import WordCloudDisplay from './WordCloudDisplay';
import { types } from '@wails/go/models';

describe('WordCloudDisplay', () => {
  const mockWords: types.WordDetail[] = [
    types.WordDetail.createFrom({ text: 'test1', size: 1, weight: 400, isGap: false }),
    types.WordDetail.createFrom({ isGap: true, gapWidth: 2 }),
    types.WordDetail.createFrom({ text: 'test2', size: 2, weight: 700, isGap: false }),
  ];

  const mockDensityParams: types.DensityParams = types.DensityParams.createFrom({
    areaMultiplier: 1,
  });

  it('renders words with correct styles', () => {
    render(<WordCloudDisplay words={mockWords} wordText="test" densityParams={mockDensityParams} />);
    
    const word1 = screen.getByText('test1');
    expect(word1).toBeInTheDocument();
    expect(word1).toHaveStyle('font-size: 1rem');
    expect(word1).toHaveStyle('font-weight: 400');

    const word2 = screen.getByText('test2');
    expect(word2).toBeInTheDocument();
    expect(word2).toHaveStyle('font-size: 2rem');
    expect(word2).toHaveStyle('font-weight: 700');
  });

  it('renders gaps with correct styles', () => {
    render(<WordCloudDisplay words={mockWords} wordText="test" densityParams={mockDensityParams} />);
    
    const gaps = screen.getAllByText('', { selector: 'span' });
    const gap = gaps.find(g => g.style.width === '2rem');
    expect(gap).toBeInTheDocument();
    if (gap) {
        expect(gap).toHaveStyle('display: inline-block');
        expect(gap).toHaveStyle('width: 2rem');
        expect(gap).toHaveStyle('height: 2rem');
    }
  });

  it('applies container styles based on density', () => {
    const densityParams: types.DensityParams = types.DensityParams.createFrom({
        areaMultiplier: 1.5,
    });
    const { container } = render(<WordCloudDisplay words={mockWords} wordText="test" densityParams={densityParams} />);
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveStyle(`width: ${300 * Math.sqrt(1.5)}px`);
    expect(containerDiv).toHaveStyle(`height: ${250 * Math.sqrt(1.5)}px`);
  });
});
