<?php

namespace App\Services\Admin;

use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

final class DashboardRange
{
    public const TIMEZONE = 'Asia/Ho_Chi_Minh';

    public function __construct(public string $preset, public CarbonImmutable $from, public CarbonImmutable $to) {}

    public static function make(array $input): self
    {
        $today = CarbonImmutable::now(self::TIMEZONE)->startOfDay();
        $preset = $input['range'] ?? 'TODAY';
        [$from, $to] = match ($preset) {
            '7_DAYS' => [$today->subDays(6), $today],
            '30_DAYS' => [$today->subDays(29), $today],
            'THIS_MONTH' => [$today->startOfMonth(), $today->endOfMonth()->startOfDay()],
            'CUSTOM' => [CarbonImmutable::parse($input['from'], self::TIMEZONE), CarbonImmutable::parse($input['to'], self::TIMEZONE)],
            default => [$today, $today],
        };
        if ($from->diffInDays($to) > 365) {
            throw ValidationException::withMessages(['to' => 'Khoảng thời gian tối đa là 366 ngày.']);
        }

        return new self($preset, $from, $to->addDay());
    }

    // Timestamps are stored in UTC; civil dates (work_date/reservation_at) stay local.
    public function apply($query, string $column, bool $local = false)
    {
        return $query->where($column, '>=', ($local ? $this->from : $this->from->utc())->toDateTimeString())
            ->where($column, '<', ($local ? $this->to : $this->to->utc())->toDateTimeString());
    }

    public function previous(): self
    {
        if ($this->preset === 'THIS_MONTH') {
            return new self($this->preset, $this->from->subMonth(), $this->from);
        }

        return new self($this->preset, $this->from->subDays((int) $this->from->diffInDays($this->to)), $this->from);
    }

    public function metadata(): array
    {
        return ['preset' => $this->preset, 'from' => $this->from->toDateString(),
            'to' => $this->to->subDay()->toDateString(), 'timezone' => self::TIMEZONE];
    }
}
