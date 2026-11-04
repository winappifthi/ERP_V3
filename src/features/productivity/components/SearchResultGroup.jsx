import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPaletteOpen } from '../productivitySlice';

export default function SearchResultGroup({ group, activeIndex, indexOffset }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = (item) => {
    dispatch(setPaletteOpen(false));
    navigate(item.path);
  };

  return (
    <div>
      <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-50 sticky top-0">
        {group.typeLabel} · {group.items.length}
      </div>
      {group.items.map((item, i) => {
        const globalIdx = indexOffset + i;
        const isActive = globalIdx === activeIndex;
        return (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>
              {item.typeLabel}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{item.title}</div>
              <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
            </div>
            <span className="text-xs text-gray-400">↵</span>
          </button>
        );
      })}
    </div>
  );
}