import { FileType } from 'src/common/enums/file-type.enum';
import { Origin } from 'src/common/enums/origin.enum';
import { DocumentType } from 'src/common/enums/document-type.enum';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Issuer } from 'src/models/issuer/entities/issuer.entity';
import { User } from 'src/models/user/entities/user.entity';

@Entity('document')
export class Document {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    documentNumber: string;

    @Column({
        type: 'enum',
        enum: Origin,
    })
    role: Origin;

    @Column({
        type: 'enum',
        enum: DocumentType,
    })
    documentType: DocumentType;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    totalTaxAmount: number;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    netAmount: number;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    fileKey: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    fileUrl: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    fileName: string;

    @Column({
        type: 'enum',
        enum: FileType,
        nullable: true,
    })
    fileType: FileType;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Issuer, issuer => issuer.documents, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'issuerId' })
    issuer: Issuer;

    @Column()
    issuerId: string;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'createdByUserId' })
    createdBy: User;

    @Column()
    createdByUserId: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
