export class KeepChangelogOutput {
    readonly added: string[]
    readonly changed: string[]
    readonly deprecated: string[]
    readonly removed: string[]
    readonly fixed: string[]
    readonly security: string[]

    constructor(added: string[], changed: string[], deprecated: string[], removed: string[], fixed: string[], security: string[]) {
        this.added = added
        this.changed = changed
        this.deprecated = deprecated
        this.removed = removed
        this.fixed = fixed
        this.security = security
    }
}

export interface KeepChangelogParser {
    parse(text: string): KeepChangelogOutput | null
}

enum KeepChangelogType {
    Added = 0,
    Changed,
    Deprecated,
    Removed,
    Fixed,
    Security,
    None
}

type KeepChangelogMap = {
    [P in KeepChangelogType]: string[];
}

export class ConcreteKeepChangelogParser {
    parse(text: string): KeepChangelogOutput | null {
        const lines = text.split('\n')

        var mode: KeepChangelogType = KeepChangelogType.None
        var map: KeepChangelogMap = {
            0: [],
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
            6: []
        }

        map[KeepChangelogType.Added] = []

        lines.forEach((line) => {
            if (line.toLowerCase().includes("### added")) {
                mode = KeepChangelogType.Added
            } else if (line.toLowerCase().includes("### changed")) {
                mode = KeepChangelogType.Changed
            } else if (line.toLowerCase().includes("### deprecated")) {
                mode = KeepChangelogType.Deprecated
            } else if (line.toLowerCase().includes("### removed")) {
                mode = KeepChangelogType.Removed
            } else if (line.toLowerCase().includes("### fixed")) {
                mode = KeepChangelogType.Fixed
            } else if (line.toLowerCase().includes("### security")) {
                mode = KeepChangelogType.Security
            } else if (line.toLowerCase().includes("---")) {
                mode = KeepChangelogType.None
            } else {
                if (line.trim().length > 0) {
                    map[mode].push(line.trim())
                }
            }
        })

        const validTypes = [KeepChangelogType.Added,
            KeepChangelogType.Changed,
            KeepChangelogType.Deprecated,
            KeepChangelogType.Removed,
            KeepChangelogType.Fixed,
            KeepChangelogType.Security]

        // A reduce would be a lot better
        var count = 0
        validTypes.forEach((type) => {
            count = count + map[type].length
        })

        if (count === 0) {
            return null
        }

        return new KeepChangelogOutput(
            map[KeepChangelogType.Added],
            map[KeepChangelogType.Changed],
            map[KeepChangelogType.Deprecated],
            map[KeepChangelogType.Removed],
            map[KeepChangelogType.Fixed],
            map[KeepChangelogType.Security]
        )
    }
}

