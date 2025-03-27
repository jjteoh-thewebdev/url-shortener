import { resolve } from 'path';

module.exports = (path: string, options: any) => {
    // Handle @/ path alias
    if (path.startsWith('@/')) {
        const resolvedPath = resolve(__dirname, '..', path.slice(2));
        return options.defaultResolver(resolvedPath, options);
    }

    // Handle .js extensions in imports
    if (path.endsWith('.js')) {
        const resolvedPath = resolve(options.basedir || process.cwd(), path.slice(0, -3));
        return options.defaultResolver(resolvedPath, options);
    }

    // Use default resolver for all other paths
    return options.defaultResolver(path, options);
};