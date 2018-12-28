/*
 * Poggit-Delta
 *
 * Copyright (C) 2018-2019 Poggit
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm"
import {Project} from "../ci/Project"
import {User} from "../gh/User"
import {AuthorType, CategoryType} from "../../consts"
import {getEnumNames} from "../../util"
import {ReleaseVersion} from "./ReleaseVersion"

@Entity()
@Index(["synopsis", "description"], {fulltext: true})
export class Release{
	@PrimaryGeneratedColumn() id: number
	@Index({unique: true}) @Column() name: string
	@OneToOne(() => Project) @JoinColumn() project: Project
	@Column({type: "text"}) synopsis: string
	@Column({type: "longtext"}) description: string
	@Column({type: "blob"}) icon: Buffer
	@Column() licenseName: string
	@Column({type: "longtext", nullable: true}) licenseContent?: string

	@Column() isOfficial: boolean
	@Column() isFeatured: boolean
	@Column() callsHome: boolean
	@Column() callsThirdParty: boolean

	@OneToMany(() => ReleaseAuthor, author => author.release) authors: ReleaseAuthor[]
	@Column({type: "enum", enum: getEnumNames(CategoryType)})
	@OneToMany(() => ReleaseCategory, category => category.release) minorCategories: ReleaseCategory[]

	@OneToMany(() => ReleaseVersion, version => version.release) versions: ReleaseVersion[]

	@OneToMany(() => ReleasePermission, version => version.release) permissions: ReleasePermission[]
	@OneToMany(() => ReleaseCommand, version => version.release) commands: ReleaseCommand[]
}

@Entity()
@Index(["author", "release"], {unique: true})
export class ReleaseAuthor{
	@PrimaryGeneratedColumn() id: number
	@ManyToOne(() => User) author: User
	@ManyToOne(() => Release, release => release.authors) release: Release
	@Column({type: "enum", enum: getEnumNames(AuthorType)}) type: keyof AuthorType
}

@Entity()
export class ReleaseCategory{
	@PrimaryGeneratedColumn() id: number
	@ManyToOne(() => Release, release => release.minorCategories) release: Release
	@Column() category: CategoryType
}

@Entity()
export class ReleasePermission{
	@PrimaryGeneratedColumn() id: number
	@ManyToOne(() => Release, release => release.commands) release: Release
	@Column() name: string
	@Column({type: "text"}) description: string
}

@Entity()
export class ReleaseCommand{
	@PrimaryGeneratedColumn() id: number
	@ManyToOne(() => Release, release => release.commands) release: Release
	@Column() name: string
	@Column({type: "text"}) description: string
}
