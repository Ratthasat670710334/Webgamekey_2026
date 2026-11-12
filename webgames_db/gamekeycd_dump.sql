--
-- PostgreSQL database dump
--

\restrict Ux4NqBMgqTqTHgkvKMzYOVFz1fEDRIJKIPL2JOCEvqQR7fRhnBIwKwcTWDb3eBJ

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: coupon_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_codes (
    code_id integer NOT NULL,
    package_id integer NOT NULL,
    coupon_code character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying,
    CONSTRAINT coupon_codes_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'sold'::character varying])::text[])))
);


ALTER TABLE public.coupon_codes OWNER TO postgres;

--
-- Name: coupon_codes_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupon_codes_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_codes_code_id_seq OWNER TO postgres;

--
-- Name: coupon_codes_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupon_codes_code_id_seq OWNED BY public.coupon_codes.code_id;


--
-- Name: coupon_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_packages (
    package_id integer NOT NULL,
    game_name character varying(100) NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    max_per_user integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.coupon_packages OWNER TO postgres;

--
-- Name: coupon_packages_package_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupon_packages_package_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_packages_package_id_seq OWNER TO postgres;

--
-- Name: coupon_packages_package_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupon_packages_package_id_seq OWNED BY public.coupon_packages.package_id;


--
-- Name: game_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_keys (
    key_id bigint NOT NULL,
    game_id bigint NOT NULL,
    key_code character varying(255) NOT NULL,
    order_id bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sold_at timestamp with time zone
);


ALTER TABLE public.game_keys OWNER TO postgres;

--
-- Name: game_keys_key_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_keys_key_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_keys_key_id_seq OWNER TO postgres;

--
-- Name: game_keys_key_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_keys_key_id_seq OWNED BY public.game_keys.key_id;


--
-- Name: game_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_orders (
    order_id bigint NOT NULL,
    user_id integer NOT NULL,
    game_id bigint NOT NULL,
    quantity integer NOT NULL,
    total_price numeric(10,2) NOT NULL,
    status character varying(30) DEFAULT 'ชำระเงินสำเร็จ'::character varying NOT NULL,
    purchased_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT game_orders_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT game_orders_total_price_check CHECK ((total_price >= (0)::numeric))
);


ALTER TABLE public.game_orders OWNER TO postgres;

--
-- Name: game_orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_orders_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_orders_order_id_seq OWNER TO postgres;

--
-- Name: game_orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_orders_order_id_seq OWNED BY public.game_orders.order_id;


--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id bigint NOT NULL,
    title text NOT NULL,
    genre character varying(50) NOT NULL,
    price numeric(10,2) NOT NULL,
    discount_price numeric(10,2) NOT NULL,
    discount integer NOT NULL,
    rating numeric(3,1) NOT NULL,
    platform character varying(100) NOT NULL,
    region character varying(100) NOT NULL,
    poster text NOT NULL,
    detail text NOT NULL,
    status character varying(50) DEFAULT 'พร้อมจำหน่าย'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT games_discount_check CHECK (((discount >= 0) AND (discount <= 100))),
    CONSTRAINT games_discount_price_check CHECK ((discount_price >= (0)::numeric)),
    CONSTRAINT games_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT games_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.games_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.games_id_seq OWNER TO postgres;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    code_id integer NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    purchased_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'customer'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'customer'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: coupon_codes code_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_codes ALTER COLUMN code_id SET DEFAULT nextval('public.coupon_codes_code_id_seq'::regclass);


--
-- Name: coupon_packages package_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_packages ALTER COLUMN package_id SET DEFAULT nextval('public.coupon_packages_package_id_seq'::regclass);


--
-- Name: game_keys key_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_keys ALTER COLUMN key_id SET DEFAULT nextval('public.game_keys_key_id_seq'::regclass);


--
-- Name: game_orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_orders ALTER COLUMN order_id SET DEFAULT nextval('public.game_orders_order_id_seq'::regclass);


--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: coupon_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_codes (code_id, package_id, coupon_code, status) FROM stdin;
\.


--
-- Data for Name: coupon_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_packages (package_id, game_name, title, description, price, max_per_user, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: game_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_keys (key_id, game_id, key_code, order_id, created_at, sold_at) FROM stdin;
\.


--
-- Data for Name: game_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_orders (order_id, user_id, game_id, quantity, total_price, status, purchased_at) FROM stdin;
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, title, genre, price, discount_price, discount, rating, platform, region, poster, detail, status, created_at, updated_at) FROM stdin;
1	ELDEN RING	RPG	1490.00	899.00	40	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg	เกม Action RPG ในโลกแฟนตาซีที่เต็มไปด้วยการผจญภัยและศัตรูที่ท้าทาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
2	Cyberpunk 2077	Action	1790.00	699.00	61	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg	เกม Open World ในเมือง Night City ที่เต็มไปด้วยเทคโนโลยีและภารกิจ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
3	Red Dead Redemption 2	Adventure	1890.00	799.00	58	9.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg	เกมผจญภัยโลกเปิดในยุคคาวบอย สำรวจโลกและเรื่องราวของแก๊งอาชญากร	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
4	Grand Theft Auto V	Action	1190.00	399.00	66	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg	เกม Open World ที่ให้สำรวจเมือง Los Santos และทำภารกิจหลากหลาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
5	Hogwarts Legacy	Adventure	1790.00	699.00	61	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg	เกมผจญภัยในโลกเวทมนตร์ของ Hogwarts พร้อมการเรียนรู้คาถา	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
6	Baldur's Gate 3	RPG	1599.00	1099.00	31	9.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg	เกม RPG ที่มีเนื้อเรื่องแตกแขนงและระบบต่อสู้แบบวางแผน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
7	Black Myth: Wukong	Action	1890.00	1290.00	32	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg	เกม Action RPG ที่ได้รับแรงบันดาลใจจากตำนานไซอิ๋ว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
8	Forza Horizon 5	Racing	1290.00	599.00	54	9.1	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1551360/header.jpg	เกมแข่งรถโลกเปิดในประเทศเม็กซิโก	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
9	Resident Evil 4	Horror	1490.00	799.00	46	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2050650/header.jpg	เกม Survival Horror ที่ติดตามภารกิจช่วยเหลือลูกสาวประธานาธิบดี	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
10	HELLDIVERS 2	Action	1290.00	899.00	30	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/553850/header.jpg	เกมยิงแบบร่วมมือกันต่อสู้กับศัตรูจากต่างดาว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
11	Stardew Valley	Simulation	315.00	189.00	40	9.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/header.jpg	เกมจำลองการทำฟาร์ม ใช้ชีวิตในชนบทและสร้างความสัมพันธ์กับชาวเมือง	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
12	Hades	Action	460.00	230.00	50	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/header.jpg	เกม Roguelike Action ต่อสู้เพื่อหลบหนีจากยมโลก	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
13	Hades II	Action	590.00	472.00	20	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/header.jpg	เกม Roguelike Action ผจญภัยในยมโลกด้วยตัวละครและพลังใหม่	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
14	Hollow Knight	Adventure	315.00	157.00	50	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg	เกม Metroidvania สำรวจอาณาจักรใต้ดิน Hallownest	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
15	Hollow Knight: Silksong	Adventure	590.00	531.00	10	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/header.jpg	เกมผจญภัย Metroidvania ที่เน้นการสำรวจและการต่อสู้	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
16	Sekiro: Shadows Die Twice	Action	1990.00	995.00	50	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/header.jpg	เกม Action ผจญภัยในญี่ปุ่นยุคเซ็นโกคุ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
17	Dark Souls III	RPG	1590.00	795.00	50	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/374320/header.jpg	เกม Action RPG ต่อสู้กับศัตรูและบอสสุดท้าทาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
18	Lies of P	RPG	1690.00	845.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1627720/header.jpg	เกม Soulslike ที่ตีความเรื่องพิน็อกคิโอในโลกดาร์กแฟนตาซี	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
19	Monster Hunter: World	Action	990.00	495.00	50	9.1	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/header.jpg	เกมล่าสัตว์ประหลาดขนาดใหญ่และสร้างอุปกรณ์จากวัตถุดิบ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
20	Monster Hunter Rise	Action	990.00	495.00	50	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1446780/header.jpg	เกมล่ามอนสเตอร์พร้อมระบบการเคลื่อนไหวที่รวดเร็ว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
21	The Witcher 3: Wild Hunt	RPG	1090.00	219.00	80	9.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/header.jpg	เกม RPG โลกเปิด รับบท Geralt นักล่าปีศาจ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
22	The Elder Scrolls V: Skyrim Special Edition	RPG	1390.00	417.00	70	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/489830/header.jpg	เกม RPG โลกเปิดในดินแดน Skyrim	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
23	Fallout 4	RPG	990.00	330.00	67	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/377160/header.jpg	เกม RPG โลกหลังหายนะที่ผู้เล่นสำรวจดินแดนรกร้าง	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
24	BORDERLANDS 3	Action	1590.00	318.00	80	8.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/397540/header.jpg	เกมยิงมุมมองบุคคลที่หนึ่งผสมระบบสะสมอุปกรณ์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
25	DOOM Eternal	Action	1290.00	387.00	70	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/header.jpg	เกมยิงรวดเร็วต่อสู้กับปีศาจจากนรก	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
26	Cyberpunk 2077: Phantom Liberty	Action	799.00	639.00	20	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2138330/header.jpg	ส่วนเสริมเนื้อเรื่องของ Cyberpunk 2077 ในเขต Dogtown	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
27	The Last of Us Part I	Adventure	1690.00	845.00	50	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1888930/header.jpg	เกมผจญภัยเอาชีวิตรอดในโลกหลังการระบาด	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
28	God of War	Action	1390.00	695.00	50	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/header.jpg	เกม Action ผจญภัยของ Kratos และ Atreus ในดินแดนนอร์ส	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
29	God of War Ragnarök	Action	1690.00	1352.00	20	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2322010/header.jpg	เกม Action ผจญภัยที่สานต่อเรื่องราวของ Kratos	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
30	Marvel's Spider-Man Remastered	Action	1690.00	845.00	50	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817070/header.jpg	เกม Action โลกเปิดที่ให้สวมบท Spider-Man	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
31	Marvel's Spider-Man: Miles Morales	Action	1290.00	645.00	50	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1817190/header.jpg	เกม Action ผจญภัยของ Miles Morales ในนิวยอร์ก	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
32	UNCHARTED: Legacy of Thieves Collection	Adventure	1690.00	845.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1659420/header.jpg	รวมเกมผจญภัยล่าสมบัติและสำรวจโบราณสถาน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
33	Horizon Zero Dawn Complete Edition	Adventure	1090.00	327.00	70	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1151640/header.jpg	เกม Action RPG โลกเปิดที่มนุษย์อยู่ร่วมกับจักรกล	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
34	Horizon Forbidden West Complete Edition	Adventure	1690.00	1352.00	20	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2420110/header.jpg	เกมผจญภัยโลกเปิดในดินแดนหลังอารยธรรมล่มสลาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
35	Days Gone	Action	1290.00	387.00	70	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1259420/header.jpg	เกมเอาชีวิตรอดจากฝูง Freakers ในโลกหลังหายนะ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
36	Death Stranding Director's Cut	Adventure	1290.00	645.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1850570/header.jpg	เกมผจญภัยส่งของเชื่อมต่อผู้คนในโลกที่ล่มสลาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
37	Control Ultimate Edition	Action	990.00	297.00	70	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/870780/header.jpg	เกม Action เหนือธรรมชาติภายในอาคารลึกลับ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
38	Alan Wake 2	Horror	1490.00	1192.00	20	9.1	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1087100/header.jpg	เกม Survival Horror สลับเรื่องราวของนักเขียนและเจ้าหน้าที่ FBI	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
39	The Outlast Trials	Horror	990.00	693.00	30	8.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1304930/header.jpg	เกมสยองขวัญเอาชีวิตรอดที่เล่นร่วมกับเพื่อนได้	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
40	Phasmophobia	Horror	315.00	252.00	20	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/739630/header.jpg	เกมสืบสวนผีโดยใช้อุปกรณ์ตรวจจับปรากฏการณ์เหนือธรรมชาติ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
41	Lethal Company	Horror	315.00	252.00	20	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1966720/header.jpg	เกมร่วมมือกันเก็บเศษซากบนดวงจันทร์อันตราย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
42	Sons Of The Forest	Horror	590.00	413.00	30	8.6	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1326470/header.jpg	เกมเอาชีวิตรอดบนเกาะลึกลับที่เต็มไปด้วยสิ่งมีชีวิตประหลาด	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
43	Dying Light 2 Stay Human	Action	1790.00	537.00	70	8.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/534380/header.jpg	เกม Action โลกเปิดที่มีซอมบี้และระบบ Parkour	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
44	Dead by Daylight	Horror	599.00	299.00	50	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg	เกมสยองขวัญแบบหลายผู้เล่นหนึ่งคนเป็นฆาตกร	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
45	The Forest	Horror	315.00	157.00	50	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg	เกมเอาชีวิตรอดหลังเครื่องบินตกบนเกาะป่า	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
46	Subnautica	Adventure	590.00	295.00	50	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/header.jpg	เกมเอาชีวิตรอดและสำรวจใต้มหาสมุทรต่างดาว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
47	Subnautica: Below Zero	Adventure	590.00	354.00	40	8.6	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/848450/header.jpg	เกมสำรวจเอาชีวิตรอดในมหาสมุทรเขตน้ำแข็ง	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
48	No Man's Sky	Adventure	1190.00	595.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275850/header.jpg	เกมสำรวจอวกาศและดาวเคราะห์จำนวนมหาศาล	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
49	Sea of Thieves	Adventure	1290.00	645.00	50	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172620/header.jpg	เกมผจญภัยโจรสลัดและออกเดินเรือกับเพื่อน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
50	Raft	Adventure	460.00	230.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg	เกมเอาชีวิตรอดบนแพกลางมหาสมุทร	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
51	Minecraft Dungeons	Action	799.00	559.00	30	8.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1672970/header.jpg	เกม Action RPG ผจญภัยในดันเจี้ยนของจักรวาล Minecraft	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
52	Terraria	Adventure	315.00	157.00	50	9.6	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg	เกม Sandbox สำรวจ ขุดแร่ สร้างสิ่งของและต่อสู้	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
53	Factorio	Simulation	700.00	560.00	20	9.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/427520/header.jpg	เกมสร้างโรงงานและระบบอัตโนมัติบนดาวต่างดาว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
54	Satisfactory	Simulation	990.00	792.00	20	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/526870/header.jpg	เกมสร้างโรงงานสามมิติและจัดการสายการผลิต	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
55	Cities: Skylines	Simulation	990.00	247.00	75	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/255710/header.jpg	เกมจำลองการสร้างและบริหารเมือง	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
56	Cities: Skylines II	Simulation	1490.00	1192.00	20	7.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/949230/header.jpg	เกมจำลองการสร้างเมืองพร้อมระบบบริหารที่ละเอียดขึ้น	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
57	The Sims 4	Simulation	0.00	0.00	0	8.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222670/header.jpg	เกมจำลองชีวิต สร้างตัวละคร บ้าน และเรื่องราวของครอบครัว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
58	Planet Zoo	Simulation	1290.00	645.00	50	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/703080/header.jpg	เกมสร้างและบริหารสวนสัตว์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
59	Planet Coaster	Simulation	1090.00	327.00	70	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/493340/header.jpg	เกมสร้างสวนสนุกและรถไฟเหาะ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
60	Euro Truck Simulator 2	Simulation	460.00	230.00	50	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/227300/header.jpg	เกมจำลองการขับรถบรรทุกส่งสินค้าทั่วยุโรป	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
61	American Truck Simulator	Simulation	460.00	230.00	50	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/270880/header.jpg	เกมจำลองการขับรถบรรทุกเดินทางในสหรัฐอเมริกา	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
62	Microsoft Flight Simulator	Simulation	1990.00	1492.00	25	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1250410/header.jpg	เกมจำลองการบินพร้อมแผนที่โลก	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
63	House Flipper	Simulation	460.00	230.00	50	8.6	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/613100/header.jpg	เกมปรับปรุง ซ่อมแซม และตกแต่งบ้าน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
64	PowerWash Simulator	Simulation	460.00	322.00	30	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1290000/header.jpg	เกมจำลองการทำความสะอาดด้วยเครื่องฉีดน้ำแรงดันสูง	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
65	Car Mechanic Simulator 2021	Simulation	590.00	295.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1190000/header.jpg	เกมจำลองการซ่อมและปรับแต่งรถยนต์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
66	F1 24	Racing	1790.00	895.00	50	8.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2488620/header.jpg	เกมแข่งรถ Formula One พร้อมทีมและสนามแข่งขัน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
67	Assetto Corsa	Racing	590.00	118.00	80	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/244210/header.jpg	เกมแข่งรถจำลองฟิสิกส์การขับขี่	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
68	Assetto Corsa Competizione	Racing	990.00	495.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/805550/header.jpg	เกมแข่งรถ GT ที่เน้นความสมจริง	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
69	Need for Speed Heat	Racing	1390.00	278.00	80	8.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1222680/header.jpg	เกมแข่งรถบนถนนและหลบหนีตำรวจ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
70	The Crew Motorfest	Racing	1490.00	1043.00	30	8.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2698940/header.jpg	เกมแข่งรถโลกเปิดบนเกาะฮาวาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
71	Trackmania	Racing	0.00	0.00	0	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2225070/header.jpg	เกมแข่งรถจับเวลาบนสนามที่ผู้เล่นสร้างได้	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
72	Dirt Rally 2.0	Racing	990.00	198.00	80	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/690790/header.jpg	เกมแข่งรถแรลลีบนเส้นทางหลากหลาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
73	Wreckfest	Racing	990.00	396.00	60	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/228380/header.jpg	เกมแข่งรถชนทำลายที่เน้นฟิสิกส์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
74	F1 Manager 2024	Strategy	990.00	495.00	50	8.1	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2591280/header.jpg	เกมบริหารทีมแข่งรถ Formula One	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
75	Civilization VI	Strategy	990.00	247.00	75	9.1	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/289070/header.jpg	เกมวางแผนสร้างอารยธรรมตั้งแต่ยุคโบราณ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
76	Age of Empires IV	Strategy	1290.00	645.00	50	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1466860/header.jpg	เกมวางแผนการรบและสร้างอาณาจักรแบบเรียลไทม์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
77	Total War: WARHAMMER III	Strategy	1790.00	895.00	50	8.6	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1142710/header.jpg	เกมวางแผนสงครามแฟนตาซีขนาดใหญ่	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
78	XCOM 2	Strategy	990.00	148.00	85	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268500/header.jpg	เกมวางแผนผลัดตาต่อสู้กับกองกำลังเอเลียน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
79	RimWorld	Simulation	990.00	792.00	20	9.6	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/294100/header.jpg	เกมจำลองการสร้างอาณานิคมและเอาชีวิตรอด	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
80	Oxygen Not Included	Simulation	460.00	230.00	50	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/457140/header.jpg	เกมจำลองการจัดการฐานใต้ดินและทรัพยากร	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
81	Slay the Spire	Strategy	460.00	230.00	50	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/646570/header.jpg	เกมการ์ด Roguelike สร้างเด็คเพื่อพิชิตหอคอย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
82	Vampire Survivors	Action	169.00	84.00	50	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1794680/header.jpg	เกมเอาชีวิตรอดจากฝูงศัตรูด้วยการอัปเกรดอาวุธ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
83	Balatro	Strategy	315.00	252.00	20	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2379780/header.jpg	เกมไพ่ Roguelike ผสมการสร้างคอมโบโป๊กเกอร์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
84	Among Us	Indie	169.00	84.00	50	8.7	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg	เกมปาร์ตี้ค้นหาผู้แอบแฝงในทีม	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
85	Cuphead	Action	590.00	295.00	50	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/268910/header.jpg	เกมแพลตฟอร์มต่อสู้บอสด้วยภาพสไตล์การ์ตูนยุคเก่า	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
86	Celeste	Indie	460.00	230.00	50	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/header.jpg	เกมแพลตฟอร์มปีนเขาที่เน้นความแม่นยำและเรื่องราว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
87	Undertale	RPG	199.00	99.00	50	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/391540/header.jpg	เกม RPG ที่การตัดสินใจของผู้เล่นส่งผลต่อเรื่องราว	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
88	DAVE THE DIVER	Adventure	590.00	472.00	20	9.3	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1868140/header.jpg	เกมสำรวจทะเลและบริหารร้านซูชิ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
89	Sea of Stars	RPG	590.00	413.00	30	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1244090/header.jpg	เกม RPG ผลัดตาที่ได้แรงบันดาลใจจากเกมคลาสสิก	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
90	Disco Elysium - The Final Cut	RPG	990.00	247.00	75	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/632360/header.jpg	เกม RPG สืบสวนที่เน้นบทสนทนาและการตัดสินใจ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
91	Persona 5 Royal	RPG	1990.00	995.00	50	9.5	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/header.jpg	เกม JRPG ที่ติดตามกลุ่ม Phantom Thieves	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
92	Like a Dragon: Infinite Wealth	RPG	1990.00	1393.00	30	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2072450/header.jpg	เกม RPG ผจญภัยในญี่ปุ่นและฮาวาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
93	FINAL FANTASY VII REMAKE INTERGRADE	RPG	1990.00	995.00	50	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1462040/header.jpg	เกม RPG แอ็กชันรีเมกเรื่องราว Final Fantasy VII	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
94	NieR:Automata	RPG	1190.00	476.00	60	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/524220/header.jpg	เกม Action RPG ในโลกอนาคตที่มนุษย์ต่อสู้ผ่านแอนดรอยด์	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
95	DOOM	Action	990.00	198.00	80	9.2	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/379720/header.jpg	เกมยิงมุมมองบุคคลที่หนึ่งต่อสู้กับปีศาจ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
96	Titanfall 2	Action	990.00	99.00	90	9.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1237970/header.jpg	เกมยิง Sci-fi ที่มีทั้งการต่อสู้ของนักบินและหุ่นยนต์ Titan	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
97	Apex Legends	Action	0.00	0.00	0	8.4	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/header.jpg	เกม Battle Royale แบบทีมที่มีตัวละครและความสามารถเฉพาะ	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
98	Counter-Strike 2	Action	0.00	0.00	0	8.8	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/730/header.jpg	เกมยิงแข่งขันแบบทีมวางระเบิดและต่อต้าน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
99	Dota 2	Strategy	0.00	0.00	0	8.9	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/header.jpg	เกม MOBA แข่งขันแบบทีมโดยเลือกฮีโร่และวางแผน	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
100	Team Fortress 2	Action	0.00	0.00	0	9.0	Steam	Global	https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/440/header.jpg	เกมยิงแบบทีมที่มีคลาสตัวละครและรูปแบบการเล่นหลากหลาย	พร้อมจำหน่าย	2026-11-12 12:57:42.320811+00	2026-11-12 12:57:42.320811+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, user_id, code_id, purchase_price, purchased_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash, email, role, status, created_at) FROM stdin;
\.


--
-- Name: coupon_codes_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_codes_code_id_seq', 1, false);


--
-- Name: coupon_packages_package_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_packages_package_id_seq', 1, false);


--
-- Name: game_keys_key_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_keys_key_id_seq', 1, false);


--
-- Name: game_orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_orders_order_id_seq', 1, false);


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.games_id_seq', 100, true);


--
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, false);


--
-- Name: coupon_codes coupon_codes_coupon_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_codes
    ADD CONSTRAINT coupon_codes_coupon_code_key UNIQUE (coupon_code);


--
-- Name: coupon_codes coupon_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_codes
    ADD CONSTRAINT coupon_codes_pkey PRIMARY KEY (code_id);


--
-- Name: coupon_packages coupon_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_packages
    ADD CONSTRAINT coupon_packages_pkey PRIMARY KEY (package_id);


--
-- Name: game_keys game_keys_key_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_keys
    ADD CONSTRAINT game_keys_key_code_key UNIQUE (key_code);


--
-- Name: game_keys game_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_keys
    ADD CONSTRAINT game_keys_pkey PRIMARY KEY (key_id);


--
-- Name: game_orders game_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_orders
    ADD CONSTRAINT game_orders_pkey PRIMARY KEY (order_id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: orders orders_code_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_code_id_key UNIQUE (code_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: game_keys_available_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_keys_available_idx ON public.game_keys USING btree (game_id, key_id) WHERE (order_id IS NULL);


--
-- Name: game_orders_user_purchased_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_orders_user_purchased_idx ON public.game_orders USING btree (user_id, purchased_at DESC);


--
-- Name: coupon_codes coupon_codes_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_codes
    ADD CONSTRAINT coupon_codes_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.coupon_packages(package_id) ON DELETE CASCADE;


--
-- Name: game_keys game_keys_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_keys
    ADD CONSTRAINT game_keys_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;


--
-- Name: game_keys game_keys_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_keys
    ADD CONSTRAINT game_keys_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.game_orders(order_id) ON DELETE SET NULL;


--
-- Name: game_orders game_orders_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_orders
    ADD CONSTRAINT game_orders_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE RESTRICT;


--
-- Name: game_orders game_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_orders
    ADD CONSTRAINT game_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: orders orders_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_code_id_fkey FOREIGN KEY (code_id) REFERENCES public.coupon_codes(code_id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- PostgreSQL database dump complete
--

\unrestrict Ux4NqBMgqTqTHgkvKMzYOVFz1fEDRIJKIPL2JOCEvqQR7fRhnBIwKwcTWDb3eBJ

