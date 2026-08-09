const path = require('path');

const loadWithMocks = (targetRelativePath, mocks) => {
  const targetPath = path.resolve(process.cwd(), targetRelativePath);
  const targetResolved = require.resolve(targetPath);
  const previousEntries = new Map();

  for (const [mockRelativePath, mockExports] of Object.entries(mocks)) {
    const resolvedMockPath = require.resolve(path.resolve(path.dirname(targetResolved), mockRelativePath));
    previousEntries.set(resolvedMockPath, require.cache[resolvedMockPath]);
    require.cache[resolvedMockPath] = {
      id: resolvedMockPath,
      filename: resolvedMockPath,
      loaded: true,
      exports: mockExports,
    };
  }

  delete require.cache[targetResolved];

  const restore = () => {
    delete require.cache[targetResolved];

    for (const [resolvedMockPath, previousEntry] of previousEntries.entries()) {
      if (previousEntry) {
        require.cache[resolvedMockPath] = previousEntry;
      } else {
        delete require.cache[resolvedMockPath];
      }
    }
  };

  return {
    module: require(targetResolved),
    restore,
  };
};

module.exports = { loadWithMocks };
