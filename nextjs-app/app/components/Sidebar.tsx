"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORY_COLORS } from "../constants";

interface SidebarProps {
  tasks: { category: string }[];
  activeCategory: string;
  onCategoryChange: (cat: string | null) => void;
  onCategoryDblClick: (cat: string) => void;
}

export default function Sidebar({ tasks, activeCategory, onCategoryChange, onCategoryDblClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
      className={collapsed ? "collapsed" : "open"}
      style={{ transform: isVisible ? undefined : "translateX(-100%)" }}
    >
      <h3 id="sidebar-title">Categories</h3>
      <button
        id="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? "☰" : "◂"}
      </button>
      <div id="sidebar-content">
        <div id="category-list">
        <motion.button
          className={`category-filter-btn category-filter-all ${
            !activeCategory ? "active" : ""
          }`}
          onClick={() => onCategoryChange(null)}
          whileHover={{ scale: 1.02, y: -2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)", zIndex: 5 }}
          transition={{ duration: 0.15 }}
          style={{ position: "relative", zIndex: 0 }}
        >
          <span className="category-all-icon">+</span>
          <span>All</span>
        </motion.button>
        {activeCategories.map((cat) => (
          <motion.button
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
            whileHover={{ scale: 1.02, y: -2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)", zIndex: 5 }}
            transition={{ duration: 0.15 }}
            style={{ position: "relative", zIndex: 0 }}
          >
            <span
              className="category-dot"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            <span>{cat}</span>
            </motion.button>
        ))}
      </div>
      </div>
    </div>
  );
}
