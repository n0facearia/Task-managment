"use client";

import { useMemo } from "react";
import { CATEGORY_COLORS } from "../constants";

interface SidebarProps {
  tasks: { category: string }[];
  activeCategory: string;
  onCategoryChange: (cat: string | null) => void;
  onCategoryDblClick: (cat: string) => void;
}

export default function Sidebar({ tasks, activeCategory, onCategoryChange, onCategoryDblClick }: SidebarProps) {
  const activeCategories = useMemo(() => {
    return Object.keys(CATEGORY_COLORS).filter((cat) =>
      tasks.some(
        (t) => t.category.toLowerCase() === cat.toLowerCase(),
      ),
    );
  }, [tasks]);

  const isVisible = activeCategories.length > 0;

  return (
    <div
      id="category-sidebar"
      style={{ transform: isVisible ? "translateX(0)" : undefined }}
    >
      <h3 id="sidebar-title">Categories</h3>
      <div id="category-list">
        <button
          className={`category-filter-btn category-filter-all ${
            !activeCategory ? "active" : ""
          }`}
          onClick={() => onCategoryChange(null)}
        >
          <span className="category-all-icon">+</span>
          <span>All</span>
        </button>
        {activeCategories.map((cat) => (
          <button
            key={cat}
            className={`category-filter-btn ${
              activeCategory.toLowerCase() === cat.toLowerCase()
                ? "active"
                : ""
            }`}
            onClick={() =>
              onCategoryChange(
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? null
                  : cat,
              )
            }
            onDoubleClick={() => onCategoryDblClick(cat)}
          >
            <span
              className="category-dot"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            <span>{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
