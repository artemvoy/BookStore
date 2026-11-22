import { useEffect, useState } from 'react';
import { getCategories } from './api.js';
import { CATEGORIES } from './data/shop.js';

// Shared across components so the header and catalog fetch the list once.
let request;

// Call after the admin adds, renames or deletes a category so every menu reloads the list.
export function refreshCategories() {
  request = undefined;
  window.dispatchEvent(new Event('categories-change'));
}

// Backend categories in the shape the menu uses (slug = id, no subcategories yet).
// Falls back to the mock list when the API is unreachable.
export default function useCategories() {
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    let alive = true;
    const load = () => {
      request ??= getCategories().catch((err) => {
        request = undefined;
        throw err;
      });
      request
        .then((list) => {
          if (alive) setCategories(list.map((c) => ({ slug: String(c.id), id: c.id, name: c.name, subcategories: [] })));
        })
        .catch(() => {});
    };
    load();
    window.addEventListener('categories-change', load);
    return () => {
      alive = false;
      window.removeEventListener('categories-change', load);
    };
  }, []);

  return categories;
}
