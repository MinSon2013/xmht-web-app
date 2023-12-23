import { forwardRef, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ReportRepository } from './repository/report.repository';
import { Reports } from './entities/report.entity';
import { ModifyReportDto } from './dto/modify-report.dto';
import { NotificationService } from '../notification/notification.service';
import { SearchDto } from './dto/search.dto';

@Injectable()
export class ReportService {
    constructor(
        public readonly reportRepo: ReportRepository,
        private readonly userService: UserService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
        private readonly notificationService: NotificationService,
    ) { }

    async findAll(userId: number, agencyId: number, date?: string): Promise<Reports[]> {
        const userEntity = await this.userService.getOne(userId);
        if (userEntity) {
            let sql = this.reportRepo.createQueryBuilder()
                .orderBy("STR_TO_DATE(update_date, \'%H:%i:%s %d/%m/%Y\')", "DESC")
                .groupBy("update_date")
                .addGroupBy("district_id")
                .addGroupBy("province_id")
                .addGroupBy("id");

            if (date) {
                date = '%' + date;
                sql = sql.where("update_date LIKE :updateDate", { updateDate: date });
                if (!userEntity.isAdmin && !userEntity.isStocker) {
                    sql = sql.andWhere("agency_id = :agencyId", { agencyId });
                }
            } else {
                if (!userEntity.isAdmin && !userEntity.isStocker) {
                    sql = sql.where("agency_id = :agencyId", { agencyId });
                }
            }
            return await sql.getMany();
        } else {
            return [];
        }

    }

    async findOne(id: number): Promise<Reports> {
        return await this.reportRepo.getOne(id);
    }

    async create(modifyReportDto: ModifyReportDto): Promise<Reports> {
        return await this.reportRepo.createReport(modifyReportDto, this.notificationService);
    }

    async update(modifyReportDto: ModifyReportDto): Promise<UpdateResult> {
        return await this.reportRepo.updateReport(modifyReportDto, this.notificationService);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.reportRepo.deleteReport(id);
    }


    async uploadFile(reportId: number, file: { path, filename, mimetype }): Promise<Reports | any> {
        const res = await this.reportRepo.createQueryBuilder()
            .update(Reports)
            .set({ filePath: file.path, attachFile: file.filename, mimeType: file.mimetype })
            .where("id = :id", { id: reportId })
            .execute();
        if (res.affected > 0) {
            return { statusCode: 200 };
        }
        return { statusCode: 400 };
    }

    async getFileById(id: number) {
        const row = await this.reportRepo.findOne({
            where: { id }
        });
        if (!row) {
            throw new NotFoundException();
        }
        return row;
    }

    async search(searchDto: SearchDto): Promise<Reports[]> {
        return await this.findAll(searchDto.userId, searchDto.agencyId, searchDto.date);
    }
}
