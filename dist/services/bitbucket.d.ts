export interface BitbucketRepo {
    name: string;
    slug: string;
    cloneUrl: string;
}
/**
 * Obtiene todos los repositorios del workspace de Bitbucket.
 * Maneja paginación automáticamente.
 */
export declare function getRepositories(): Promise<BitbucketRepo[]>;
/**
 * Crea una rama en un repositorio de Bitbucket.
 * Intenta desde `main`, si falla prueba `master`, si falla retorna '' para que el caller pregunte.
 */
export declare function createBranch(repoSlug: string, branchName: string): Promise<string>;
/**
 * Crea una rama especificando la rama fuente explícitamente.
 */
export declare function createBranchFrom(repoSlug: string, branchName: string, sourceBranch: string): Promise<void>;
