--
-- PostgreSQL database dump
--

\restrict wNNge07tFVrD5VfV4xQpELCrag8gV89qzJP23ICtqivAjq1Se5gBYPlSyTUNrkB

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
1	1	ROV-AAAA-1111	sold
2	1	ROV-BBBB-2222	sold
3	1	ROV-CCCC-3333	sold
4	2	VALO-XXXX-9999	sold
5	2	VALO-XXXX-9998	sold
6	2	VALO-XXXX-9997	sold
7	2	VALO-XXXX-9996	sold
8	2	VALO-XXXX-9995	sold
9	2	VALO-XXXX-9994	sold
\.


--
-- Data for Name: coupon_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_packages (package_id, game_name, title, description, price, max_per_user, is_active, created_at) FROM stdin;
1	ROV	คูปองสกินแรร์ 100 คูปอง	ใช้สำหรับแลกสกินระดับ Limited ในเกม ROV	99.00	2	t	2026-11-07 08:42:45.244964+00
2	Valorant	Valorant Points 500 VP	เติมพอยท์เข้าเกมทันที	150.00	5	t	2026-11-07 08:42:45.244964+00
3	GameTest1111	ทดสอบ111	ทดสอบคูปอง	500.00	3	t	2026-11-07 16:22:03.365168+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, user_id, code_id, purchase_price, purchased_at) FROM stdin;
1	2	1	99.00	2026-11-07 08:42:45.244964+00
2	4	2	99.00	2026-11-07 08:46:00.921694+00
3	4	3	99.00	2026-11-07 08:46:09.312371+00
4	4	4	150.00	2026-11-07 08:46:16.522371+00
5	4	5	150.00	2026-11-07 08:53:31.830894+00
6	4	6	150.00	2026-11-07 08:53:33.426164+00
7	4	7	150.00	2026-11-07 08:53:34.604328+00
8	4	8	150.00	2026-11-07 08:53:36.752541+00
9	6	9	150.00	2026-11-07 10:33:37.372533+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash, email, role, status, created_at) FROM stdin;
1	admin_boss	pass1234	admin@test.com	admin	active	2026-11-07 08:42:45.244964+00
2	player_one	pass1234	p1@test.com	customer	active	2026-11-07 08:42:45.244964+00
3	bad_player	pass1234	bad@test.com	customer	suspended	2026-11-07 08:42:45.244964+00
6	Test00001	$2a$10$n.atbVyiJhLXuEi17Ef//ugbqFIlNgOkliU4uj9yd4QpvXDorJqJu	test01@example.com	admin	active	2026-11-07 10:32:15.487229+00
8	ApiTestdmp34iguvqgg	$2a$10$C2D6MpSzA3y2lAzoWkuA2eoUICp9ugcc/x6cEnLHwzCO.sEbu9T.S	api-test-dmp34iguvqgg@example.test	customer	active	2026-11-07 15:30:51.609489+00
9	ApiTestdmp37cxo6mk9	$2a$10$HC4tpfOem4/a0q76/cTbV.OQd/RrJG/XLBHVPxQzfJzDKiwRyvMcW	api-test-dmp37cxo6mk9@example.test	customer	active	2026-11-07 15:34:34.652951+00
10	ApiTestdmp37nuaxnsr	$2a$10$eK4Lw7PMekS4WBVdFeDxC.x2JDBiS0DpsptvK/6MWR40CG2dDJHKe	api-test-dmp37nuaxnsr@example.test	customer	active	2026-11-07 15:34:58.404098+00
4	Test00002	$2a$10$ITDHCwWdnWbV1f9hLVzkMOTtJdCbhOLRi4ThCJCpF8KtENCbYo/N6	test02@example.com	customer	active	2026-11-07 08:44:13.166106+00
\.


--
-- Name: coupon_codes_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_codes_code_id_seq', 9, true);


--
-- Name: coupon_packages_package_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_packages_package_id_seq', 2, true);


--
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 9, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 11, true);


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
-- Name: coupon_codes coupon_codes_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_codes
    ADD CONSTRAINT coupon_codes_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.coupon_packages(package_id) ON DELETE CASCADE;


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

\unrestrict wNNge07tFVrD5VfV4xQpELCrag8gV89qzJP23ICtqivAjq1Se5gBYPlSyTUNrkB

