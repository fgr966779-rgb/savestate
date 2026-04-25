// WatermelonDB SQLite adapter shim for web platform
// Web is not a supported target — this prevents bundling errors

const SQLiteAdapter = function () {
  throw new Error('WatermelonDB SQLite adapter is not supported on web.');
};

export default SQLiteAdapter;
